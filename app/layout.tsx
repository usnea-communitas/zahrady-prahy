import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import './atlas.css';
// Apply the supplied gallery theme after the atlas's structural rules.
import './gallery.css';
import './mobile.css';

const gallerySerif = Playfair_Display({
  variable: '--font-gallery-serif',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
});

const interfaceSans = Inter({
  variable: '--font-interface-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

const interfaceMono = JetBrains_Mono({
  variable: '--font-interface-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#c4c3b6',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://zahrady-prahy.vercel.app'),
  alternates: { canonical: 'https://zahrady-prahy.vercel.app/' },
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
        url: '/zahrady-prahy-og.jpg',
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
    images: ['/zahrady-prahy-og.jpg'],
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
        className={`${interfaceSans.variable} ${interfaceMono.variable} ${gallerySerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
