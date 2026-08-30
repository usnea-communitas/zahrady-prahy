import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Zahrady Prahy — živá mapa komunitních zahrad',
  description:
    'Objevujte komunitní zahrady, sousedská místa a zelené oázy na ilustrované mapě Prahy.',
  openGraph: {
    title: 'Zahrady Prahy',
    description: 'Praha roste společně.',
    type: 'website',
    locale: 'cs_CZ',
    images: [
      {
        url: '/zahrady-prahy-og.png',
        width: 1200,
        height: 630,
        alt: 'Ilustrovaná Praha s rozsvícenou komunitní zahradou',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zahrady Prahy',
    description: 'Praha roste společně.',
    images: ['/zahrady-prahy-og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
