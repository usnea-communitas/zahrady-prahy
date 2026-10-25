import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import './atlas.css';
// Apply the supplied gallery theme after the atlas's structural rules.
import './gallery.css';
import './mobile.css';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import {
  LOCALE_HEADER,
  defaultLocale,
  dictionaries,
  isLocale,
  withLocale,
  type Locale,
} from '@/lib/i18n';

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

const site = new URL('https://zahrady-prahy.vercel.app/');

/** The language of this request: Czech for `?lang=cs` (see `middleware.ts`),
 * otherwise English. A preference stored in the browser applies after load. */
async function requestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : defaultLocale;
}

/** What both languages share. */
const sharedMetadata: Metadata = {
  metadataBase: site,
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

/* English lives at `/`, Czech at `/?lang=cs`; each names itself canonical
 * and points search engines to the other. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  return {
    ...sharedMetadata,
    title: dictionaries[locale].meta.title,
    alternates: {
      canonical: withLocale(site, locale).href,
      languages: {
        en: site.href,
        cs: withLocale(site, 'cs').href,
        'x-default': site.href,
      },
    },
    openGraph: {
      ...sharedMetadata.openGraph,
      locale: locale === 'cs' ? 'cs_CZ' : 'en_US',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await requestLocale();
  return (
    <html lang={locale}>
      <body
        className={`${interfaceSans.variable} ${interfaceMono.variable} ${gallerySerif.variable} antialiased`}
      >
        {/* React 19 hoists this into <head>; the metadata API has no field
            for the Open Graph alternate locale. */}
        <meta
          property="og:locale:alternate"
          content={locale === 'cs' ? 'en_US' : 'cs_CZ'}
        />
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
