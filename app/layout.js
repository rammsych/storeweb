import './globals.css';

export const metadata = {
  title: 'Bitrineo',
  description: 'Comercio digital inteligente',

  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
