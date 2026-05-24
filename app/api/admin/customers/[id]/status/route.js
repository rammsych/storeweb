import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

export async function PATCH(request, { params }) {
  try {
    const { isActive } = await request.json();

    const customer = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    return NextResponse.json(serializeBigInt({ customer }));
  } catch (error) {
    console.error('Error updating customer status:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error al actualizar estado del cliente' }),
      { status: 500 }
    );
  }
}
