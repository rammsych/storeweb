import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

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
    const { companyId, name, email, phone, password } = body;

    if (!companyId) {
      return NextResponse.json(
        serializeBigInt({ error: 'Empresa requerida' }),
        { status: 400 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        serializeBigInt({ error: 'Faltan campos requeridos' }),
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        companyId: BigInt(companyId),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        serializeBigInt({ error: 'Este correo ya existe en esta empresa' }),
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        role: 'ADMIN',
        companyId: BigInt(companyId),
        isActive: true,
      },
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        user,
      })
    );
  } catch (error) {
    console.error('CREATE COMPANY ADMIN ERROR:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
}