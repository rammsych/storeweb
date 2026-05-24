import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        serializeBigInt({ error: 'No autenticado' }),
        { status: 401 }
      );
    }

    if (
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPER_ADMIN'
    ) {
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
      return NextResponse.json(serializeBigInt({ orders: [] }));
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: params.id,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(serializeBigInt({ orders }));
  } catch (error) {
    console.error('Error loading customer orders:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error al cargar pedidos del cliente' }),
      { status: 500 }
    );
  }
}
