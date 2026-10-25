import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import './atlas.css';
// Apply the supplied gallery theme after the atlas's structural rules.
import './gallery.css';
import './mobile.css';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { defaultLocale } from '@/lib/i18n';

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

/* The page is served in English by default; Czech is a client-side choice
 * (header switcher, remembered in the browser), so both languages share one
 * URL and the metadata describes the default. */
export const metadata: Metadata = {
  metadataBase: new URL('https://zahrady-prahy.vercel.app'),
  alternates: { canonical: 'https://zahrady-prahy.vercel.app/' },
  title: 'Gardens of Prague — a living map of community gardens',
  description:
    'Zahrady Prahy: discover community gardens, neighbourhood places and green oases on an illustrated map of Prague. Available in English and Czech.',
  applicationName: 'Zahrady Prahy',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Zahrady Prahy — Gardens of Prague',
    description: 'Prague grows together. A living map of community gardens.',
    siteName: 'Zahrady Prahy',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/zahrady-prahy-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Illustrated Prague with a community garden lit up',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zahrady Prahy — Gardens of Prague',
    description: 'Prague grows together. A living map of community gardens.',
    images: ['/zahrady-prahy-og.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale}>
      <body
        className={`${interfaceSans.variable} ${interfaceMono.variable} ${gallerySerif.variable} antialiased`}
      >
        {/* React 19 hoists this into <head>; the metadata API has no field
            for the Open Graph alternate locale. */}
        <meta property="og:locale:alternate" content="cs_CZ" />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
