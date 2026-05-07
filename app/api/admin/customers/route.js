import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
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
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error loading customers:', error);

    return NextResponse.json(
      { error: 'Error al cargar clientes' },
      { status: 500 }
    );
  }
}