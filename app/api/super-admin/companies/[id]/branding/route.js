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
      where: { id },
      data: {
        display_name: body.display_name || null,
        slogan: body.slogan || null,
        logo_url: body.logo_url || null,
        primary_color: body.primary_color || '#E83E8C',
        secondary_color: body.secondary_color || '#FFF1F7',
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