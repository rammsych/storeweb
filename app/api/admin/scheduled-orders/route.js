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
      return NextResponse.json(serializeBigInt([]));
    }

    const orders = await prisma.order.findMany({
      where: {
        companyId,
        deliveryType: 'PROGRAMADO',
        scheduledDeliveryDate: {
          not: null,
        },
        scheduledDeliveryTime: {
          not: null,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        scheduledDeliveryDate: 'asc',
      },
    });

    const events = orders.map((order) => {
      const date = order.scheduledDeliveryDate
        .toISOString()
        .split('T')[0];

      return {
        id: order.id,
        title: `${order.scheduledDeliveryTime} - ${
          order.customerName || 'Cliente'
        }`,
        start: `${date}T${order.scheduledDeliveryTime}:00`,
        end: `${date}T${order.scheduledDeliveryTime}:00`,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        notes: order.notes,
        totalEstimated: order.totalEstimated,
        scheduledDeliveryDate: date,
        scheduledDeliveryTime: order.scheduledDeliveryTime,
        status: order.status,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          unitType: item.unitType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      };
    });

    return NextResponse.json(serializeBigInt(events));
  } catch (error) {
    console.error('SCHEDULED ORDERS API ERROR:', error);

    return NextResponse.json(
      serializeBigInt({ error: 'Error cargando pedidos programados' }),
      { status: 500 }
    );
  }
}
