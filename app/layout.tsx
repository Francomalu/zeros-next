import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AuthProvider from '@/components/auth-provider';
import { Poppins } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Zeros Tour',
  description: 'Aplicacion de zeros tour para reserva de pasajes',
  generator: 'Solomillo inc',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '400', '600', '700'], // elegí los pesos que vayas a usar
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
