import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const address = String(body.address || '').trim();
    const password = String(body.password || '').trim();

    const latitude =
      body.latitude === '' || body.latitude === null || body.latitude === undefined
        ? null
        : Number(body.latitude);

    const longitude =
      body.longitude === '' || body.longitude === null || body.longitude === undefined
        ? null
        : Number(body.longitude);

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, correo y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese correo' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        latitude,
        longitude,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Usuario creado correctamente',
    });
  } catch (error) {
    console.error('REGISTER API ERROR:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor al crear la cuenta' },
      { status: 500 }
    );
  }
}