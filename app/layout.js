import './globals.css';

export const metadata = {
  title: 'Verdulería Prototipo',
  description: 'Prototipo de verdulería con login, catálogo y solicitud por correo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
