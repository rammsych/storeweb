import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      notes,
      deliveryType,
      scheduledDeliveryDate,
      scheduledDeliveryTime,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Debes agregar al menos un producto' },
        { status: 400 }
      );
    }


    if (deliveryType === 'PROGRAMADO') {




      if (!scheduledDeliveryDate || !scheduledDeliveryTime) {
        return NextResponse.json(
          { error: 'Debes indicar fecha y horario para el pedido programado' },
          { status: 400 }
        );
      }

    

      const getChileDateString = (date) => {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Santiago',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      };

      const now = new Date();

      const chileTodayString = getChileDateString(now);

      const chileToday = new Date(`${chileTodayString}T00:00:00`);

      chileToday.setDate(chileToday.getDate() + 1);

      const year = chileToday.getFullYear();
      const month = String(chileToday.getMonth() + 1).padStart(2, '0');
      const day = String(chileToday.getDate()).padStart(2, '0');

      const minAllowedDate = `${year}-${month}-${day}`;

      if (scheduledDeliveryDate < minAllowedDate) {
        return NextResponse.json(
          { error: 'La fecha debe ser desde el día siguiente' },
          { status: 400 }
        );
      }

      if (scheduledDeliveryTime < '14:00' || scheduledDeliveryTime > '18:30') {
        return NextResponse.json(
          { error: 'Solo se permiten horarios entre 14:00 y 18:30 hrs' },
          { status: 400 }
        );
      }
    }





    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let totalEstimated = 0;

    const normalizedItems = items.map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const subtotal = quantity * unitPrice;

      totalEstimated += subtotal;

      return {
        productId: item.productId,
        productName: item.productName,
        unitType: item.unitType,
        quantity,
        unitPrice,
        subtotal,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerName: user.name || '',
        customerEmail: user.email,
        customerPhone: user.phone || null,
        address: user.address || null,
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
        notes: notes || null,
        status: 'pending',
        deliveryType: deliveryType || 'NORMAL',
        scheduledDeliveryDate: scheduledDeliveryDate
          ? new Date(`${scheduledDeliveryDate}T00:00:00`)
          : null,
        scheduledDeliveryTime: scheduledDeliveryTime || null,
        totalEstimated,
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: true,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const deliveryHtml =
      order.deliveryType === 'PROGRAMADO'
        ? `
      <div style="margin:16px 0;padding:14px;border-radius:12px;background:#fff7ed;border:1px solid #fdba74;">
        <h3 style="margin:0 0 10px 0;color:#c2410c;">
          Pedido Programado
        </h3>
        <p><strong>Fecha de entrega:</strong> ${new Date(order.scheduledDeliveryDate).toLocaleDateString('es-CL')}</p>
        <p><strong>Horario:</strong> ${order.scheduledDeliveryTime} hrs</p>
      </div>
    `
        : `
      <div style="margin:16px 0;padding:14px;border-radius:12px;background:#ecfdf5;border:1px solid #86efac;">
        <strong>Tipo de entrega:</strong> Pedido normal
      </div>
    `;

    const itemsHtml = order.items
      .map(
        (item) =>
          `<li>${item.productName} - Cantidad: ${item.quantity} - Subtotal: $${item.subtotal}</li>`
      )
      .join('');

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.VENDOR_EMAIL,
      subject: 'Nueva solicitud de compra – Verdulería',
      html: `
        <h2>Nueva solicitud de compra</h2>
        <p><strong>Cliente:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Teléfono:</strong> ${order.customerPhone || '-'}</p>
        <p><strong>Dirección:</strong> ${order.address || '-'}</p>
        <p><strong>Comentario:</strong> ${order.notes || '-'}</p>
        ${deliveryHtml}
        <p><strong>Total estimado:</strong> $${order.totalEstimated}</p>
        <h3>Productos</h3>
        <ul>${itemsHtml}</ul>
      `,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: order.customerEmail,
      subject: 'Recibimos tu solicitud de compra',
      html: `
        <h2>Gracias por tu solicitud</h2>
        <p>Hola ${order.customerName}, recibimos correctamente tu pedido.</p>
        ${deliveryHtml}
        <p><strong>Total estimado:</strong> $${order.totalEstimated}</p>
        <h3>Productos solicitados</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Comentario:</strong> ${order.notes || '-'}</p>
        <p>Pronto nos pondremos en contacto contigo.</p>
      `,
    });

    return NextResponse.json({
      message: 'Solicitud enviada correctamente',
      orderId: order.id,
    });
  } catch (error) {
    console.error('ORDERS API ERROR:', error);

    return NextResponse.json(
      { error: 'Error interno al enviar la solicitud' },
      { status: 500 }
    );
  }
}