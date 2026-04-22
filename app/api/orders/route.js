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
    const { items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Debes agregar al menos un producto' },
        { status: 400 }
      );
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