import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
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
      return NextResponse.json(serializeBigInt({ customers: [] }));
    }

    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        role: true,
        companyId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(serializeBigInt({ customers }));
  } catch (error) {
    console.error('Error loading customers:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error al cargar clientes' }),
      { status: 500 }
    );
  }
}
