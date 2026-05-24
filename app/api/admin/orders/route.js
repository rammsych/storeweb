import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
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
      return NextResponse.json(serializeBigInt({ orders: [] }));
    }

    const orders = await prisma.order.findMany({
      where: {
        companyId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(serializeBigInt({ orders }));
  } catch (error) {
    console.error('ADMIN ORDERS API ERROR:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error cargando pedidos' }),
      { status: 500 }
    );
  }
}
