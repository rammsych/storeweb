import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      phone,
      address,
      latitude,
      longitude,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // HOT FIX TEMPORAL PRODUCCIÓN:
    // El schema.prisma de main no conoce companyId,
    // por eso insertamos directo con SQL.
    await prisma.$executeRaw`
      INSERT INTO "User" (
        "id",
        "name",
        "email",
        "phone",
        "address",
        "latitude",
        "longitude",
        "password",
        "companyId",
        "role",
        "createdAt",
        "updatedAt",
        "isActive"
      )
      VALUES (
        gen_random_uuid(),
        ${name},
        ${email},
        ${phone || null},
        ${address || null},
        ${latitude || null},
        ${longitude || null},
        ${hashedPassword},
        1,
        'USER',
        NOW(),
        NOW(),
        true
      )
    `;

    return NextResponse.json(
      { message: "Usuario registrado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER API ERROR:", error);

    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
