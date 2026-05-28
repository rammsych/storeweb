import './globals.css';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
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
    <html lang="es" className={montserrat.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}