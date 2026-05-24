import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();

    const company = await prisma.company.update({
      where: {
        id: BigInt(params.id),
      },
      data: {
        maintenanceMode: Boolean(body.maintenanceMode),
      },
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        company,
      })
    );
  } catch (error) {
    console.error('MAINTENANCE MODE ERROR:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error actualizando modo mantención' }),
      { status: 500 }
    );
  }
}
