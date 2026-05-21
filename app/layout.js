import './globals.css';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
});


export const metadata = {
  title: 'Bitrineo',
  description: 'Comercio digital inteligente',

  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es"  className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
