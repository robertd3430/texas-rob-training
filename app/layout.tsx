import type { Metadata } from 'next';
import './globals.css';
import { Geist, Oswald } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Texas Rob Training',
  description: 'Strength training tracker for serious powerlifters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('dark bg-background font-sans', geist.variable, oswald.variable)}>
      <body>{children}</body>
    </html>
  );
}
