import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(request) {
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

    const body = await request.json();
    const { name, email, phone, address, responsible_name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        serializeBigInt({ error: 'Nombre requerido' }),
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        serializeBigInt({ error: 'Ya existe una empresa con ese nombre' }),
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
        responsible_name,
        status: true,
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
