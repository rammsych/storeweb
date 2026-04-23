import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        unitType: body.unitType,
        imageUrl: body.imageUrl,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      message: 'Producto actualizado correctamente',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}


export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        isActive: Boolean(body.isActive),
      },
    });

    return NextResponse.json({
      message: 'Estado del producto actualizado correctamente',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error patching product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado del producto' },
      { status: 500 }
    );
  }
}