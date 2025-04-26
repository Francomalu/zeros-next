import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AuthProvider from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'Zeros Tour',
  description: 'Aplicacion de zeros tour para reserva de pasajes',
  generator: 'Solomillo inc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
