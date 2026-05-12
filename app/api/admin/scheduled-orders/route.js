import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
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
      const date = order.scheduledDeliveryDate.toISOString().split('T')[0];

      return {
        id: order.id,
        title: `${order.scheduledDeliveryTime} - ${order.customerName || 'Cliente'}`,
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

    return NextResponse.json(events);
  } catch (error) {
    console.error('SCHEDULED ORDERS API ERROR:', error);

    return NextResponse.json(
      { error: 'Error cargando pedidos programados' },
      { status: 500 }
    );
  }
}