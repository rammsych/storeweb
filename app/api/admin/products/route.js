import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        serializeBigInt({ error: 'No autenticado' }),
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        serializeBigInt({ error: 'No autorizado' }),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyIdFromUrl = searchParams.get('companyId');

    const companyId =
      session.user.role === 'SUPER_ADMIN'
        ? companyIdFromUrl
          ? BigInt(companyIdFromUrl)
          : null
        : session.user.companyId
          ? BigInt(session.user.companyId)
          : null;

    if (!companyId) {
      return NextResponse.json(
        serializeBigInt({ error: 'No se pudo determinar la empresa' }),
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const price = Number(body.price || 0);
    const unitType = String(body.unitType || '').trim();
    const categoryId = body.categoryId ? String(body.categoryId) : null;
    const imageUrl = String(body.imageUrl || '').trim();
    const isActive = Boolean(body.isActive);

    if (!name || !price || !unitType || !categoryId) {
      return NextResponse.json(
        serializeBigInt({ error: 'Nombre, precio, unidad y categoría son obligatorios' }),
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        unitType,
        categoryId,
        imageUrl: imageUrl || null,
        isActive,
        companyId,
      },
    });

    return NextResponse.json(
      serializeBigInt({
        message: 'Producto creado correctamente',
        product,
      })
    );
  } catch (error) {
    console.error('ADMIN PRODUCTS POST ERROR:', error);
    return NextResponse.json(
      serializeBigInt({ error: 'Error interno al crear producto' }),
      { status: 500 }
    );
  }
}
