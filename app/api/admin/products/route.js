import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();

    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const price = Number(body.price || 0);
    const unitType = String(body.unitType || '').trim();
    const imageUrl = String(body.imageUrl || '').trim();
    const isActive = Boolean(body.isActive);

    if (!name || !price || !unitType) {
      return NextResponse.json(
        { error: 'Nombre, precio y unidad son obligatorios' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        unitType,
        imageUrl: imageUrl || null,
        isActive,
      },
    });

    return NextResponse.json({
      message: 'Producto creado correctamente',
      product,
    });
  } catch (error) {
    console.error('ADMIN PRODUCTS POST ERROR:', error);
    return NextResponse.json(
      { error: 'Error interno al crear producto' },
      { status: 500 }
    );
  }
}