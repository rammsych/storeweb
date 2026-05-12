import nodemailer from 'nodemailer';

export async function sendOrderEmail(order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <h2>Nueva solicitud de compra</h2>
    <p><strong>Cliente:</strong> ${order.customerName}</p>
    <p><strong>Email:</strong> ${order.customerEmail}</p>
    <p><strong>Teléfono:</strong> ${order.customerPhone || 'No informado'}</p>
    <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString('es-CL')}</p>
    <p><strong>Observación:</strong> ${order.customerNote || 'Sin observaciones'}</p>
    <h3>Detalle</h3>
    <ul>
      ${order.items
        .map(
          (item) => `<li>${item.productName} - ${item.quantity} ${item.unitType.toLowerCase()} - $${item.subtotal.toLocaleString('es-CL')}</li>`
        )
        .join('')}
    </ul>
    <p><strong>Total estimado:</strong> $${order.totalEstimated.toLocaleString('es-CL')}</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.VENDOR_EMAIL,
    cc: 'stangher.felipe@gmail.com',
    subject: `Nueva solicitud de compra - ${order.customerName}`,
    html,
  });
}
