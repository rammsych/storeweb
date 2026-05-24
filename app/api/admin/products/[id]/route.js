import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

function resolveCompanyId(session, request) {
  const { searchParams } = new URL(request.url);
  const companyIdFromUrl = searchParams.get('companyId');

  if (session.user.role === 'SUPER_ADMIN') {
    return companyIdFromUrl ? BigInt(companyIdFromUrl) : null;
  }

  return session.user.companyId ? BigInt(session.user.companyId) : null;
}

export async function PUT(request, { params }) {
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

    const companyId = resolveCompanyId(session, request);

    if (!companyId) {
      return NextResponse.json(
        serializeBigInt({ error: 'No se pudo determinar la empresa' }),
        { status: 400 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        serializeBigInt({ error: 'Producto no encontrado para esta empresa' }),
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        unitType: body.unitType,
        categoryId: body.categoryId ? String(body.categoryId) : null,
        imageUrl: body.imageUrl,
        isActive: Boolean(body.isActive),
      },
    });

    return NextResponse.json(
      serializeBigInt({
        message: 'Producto actualizado correctamente',
        product: updatedProduct,
      })
    );
  } catch (error) {
    console.error('Error updating product:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error al actualizar producto' }),
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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

    const companyId = resolveCompanyId(session, request);

    if (!companyId) {
      return NextResponse.json(
        serializeBigInt({ error: 'No se pudo determinar la empresa' }),
        { status: 400 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        serializeBigInt({ error: 'Producto no encontrado para esta empresa' }),
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        isActive: Boolean(body.isActive),
      },
    });

    return NextResponse.json(
      serializeBigInt({
        message: 'Estado del producto actualizado correctamente',
        product: updatedProduct,
      })
    );
  } catch (error) {
    console.error('Error patching product:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error al actualizar estado del producto' }),
      { status: 500 }
    );
  }
}
