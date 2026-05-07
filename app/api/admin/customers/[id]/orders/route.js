import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error loading customer orders:', error);

    return NextResponse.json(
      { error: 'Error al cargar pedidos del cliente' },
      { status: 500 }
    );
  }
}