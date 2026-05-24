import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        serializeBigInt({ error: 'No autorizado' }),
        { status: 401 }
      );
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        serializeBigInt({ error: 'Permisos insuficientes' }),
        { status: 403 }
      );
    }

    const id = context.params?.id ? BigInt(context.params.id) : null;

    if (!id) {
      return NextResponse.json(
        serializeBigInt({ error: 'ID inválido' }),
        { status: 400 }
      );
    }

    const body = await request.json();

    const company = await prisma.company.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        responsible_name: body.responsible_name,
      },
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        company,
      })
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
}
