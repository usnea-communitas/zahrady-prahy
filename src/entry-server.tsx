/**
 * Server entry of the static build (scripts/build-static.mjs): renders every
 * page and describes its head. Nothing here runs on a server after the build.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { gardens } from '@/lib/gardens';
import {
  dictionaries,
  locales,
  defaultLocale,
  LOCALE_STORAGE_KEY,
} from '@/lib/i18n';
import {
  gardenStructuredData,
  pageDescription,
  pageTitle,
  shareImage,
} from '@/lib/page-meta';
import {
  MAP_ART_FULL,
  MAP_ART_PHONE_MEDIA,
  MAP_ART_PHONE_SIZES,
  MAP_ART_PHONE_SRCSET,
} from '@/lib/map/art';
import { SITE_URL, allRoutes, routePath, type Route } from '@/lib/routes';

export { routePath };
import Home from '../app/page';

export const gardenIds = gardens.map((garden) => garden.id);
export const routes: Route[] = allRoutes(gardenIds);
export const shareImages = gardens.map((garden) => ({
  id: garden.id,
  illustration: garden.illustration,
}));

export function render(route: Route): string {
  return renderToString(
    <StrictMode>
      <LocaleProvider initialLocale={route.locale}>
        <Home initialGardenId={route.gardenId} />
      </LocaleProvider>
    </StrictMode>,
  );
}

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Playfair Display, latin (src/fonts.css). */
const SERIF_FONT = '/fonts/playfair-display-9deeae77.woff2';

/** Title, description, addresses, share preview and structured data. */
export function head(route: Route): string {
  const garden = gardens.find((item) => item.id === route.gardenId) ?? null;
  const meta = dictionaries[route.locale].meta;
  const title = pageTitle(route.locale, garden);
  const description = pageDescription(route.locale, garden);
  const url = SITE_URL + routePath(route);
  const image = shareImage(garden);
  const imageAlt = garden
    ? meta.gardenImageAlt.replace('{name}', garden.name)
    : meta.shareImageAlt;
  const shareTitle = garden ? title : meta.shareTitle;
  const shareDescription = garden ? description : meta.shareDescription;
  const ogLocale = (locale: string) => (locale === 'cs' ? 'cs_CZ' : 'en_US');
  const tags = [
    // Wide screens set the title in the serif; phones show it only in a
    // garden's name, and src/main.tsx loads it there after the first paint.
    `<link rel="preload" href="${SERIF_FONT}" as="font" type="font/woff2" crossorigin${garden ? '' : ' media="(min-width: 721px)"'}>`,
    // The map is the largest picture: the one this screen will choose.
    `<link rel="preload" as="image" imagesrcset="${MAP_ART_PHONE_SRCSET}" imagesizes="${MAP_ART_PHONE_SIZES}" media="${MAP_ART_PHONE_MEDIA}" fetchpriority="high">`,
    `<link rel="preload" as="image" href="${MAP_ART_FULL}" media="not all and ${MAP_ART_PHONE_MEDIA}" fetchpriority="high">`,
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<link rel="canonical" href="${url}">`,
    ...locales.map(
      (locale) =>
        `<link rel="alternate" hreflang="${locale}" href="${SITE_URL + routePath({ ...route, locale })}">`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL + routePath({ ...route, locale: defaultLocale })}">`,
    `<meta property="og:title" content="${escape(shareTitle)}">`,
    `<meta property="og:description" content="${escape(shareDescription)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:site_name" content="Zahrady Prahy">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="${ogLocale(route.locale)}">`,
    ...locales
      .filter((locale) => locale !== route.locale)
      .map(
        (locale) =>
          `<meta property="og:locale:alternate" content="${ogLocale(locale)}">`,
      ),
    `<meta property="og:image" content="${image.url}">`,
    `<meta property="og:image:width" content="${image.width}">`,
    `<meta property="og:image:height" content="${image.height}">`,
    `<meta property="og:image:alt" content="${escape(imageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(shareTitle)}">`,
    `<meta name="twitter:description" content="${escape(shareDescription)}">`,
    `<meta name="twitter:image" content="${image.url}">`,
  ];
  if (garden)
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(gardenStructuredData(route.locale, garden)).replace(/</g, '\\u003c')}</script>`,
    );
  return tags.join('\n    ');
}

/**
 * The one script in a page, in the head of `/` only: links made before the
 * atlas had page addresses (`?zahrada=`, `?garden=`, `?lang=`) and a visitor
 * who chose Czech go to their page before anything renders. It is constant
 * for a given catalogue, so the Content-Security-Policy allows it by its hash
 * (vercel.json; the build checks it).
 */
export const legacyRedirectScript =
  '(function(){try{var l=location,q=new URLSearchParams(l.search),ids=' +
  JSON.stringify(gardenIds) +
  ",k='" +
  LOCALE_STORAGE_KEY +
  "',g=q.get('zahrada')||q.get('garden')||'',c=q.get('lang'),s='';" +
  "if(c!=='cs'&&c!=='en')c='';try{s=localStorage.getItem(k)||'';if(c)localStorage.setItem(k,c)}catch(e){}" +
  "var lang=c||(s==='cs'?'cs':'en');if(ids.indexOf(g)<0)g='';" +
  "['zahrada','garden','lang'].forEach(function(n){q.delete(n)});var r=q.toString();" +
  "var u=(lang==='cs'?'/cs':'')+(g?'/zahrada/'+g:'')+'/'+(r?'?'+r:'')+l.hash;" +
  'if(u!==l.pathname+l.search+l.hash)l.replace(u)}catch(e){}})();';

export function sitemap(): string {
  const pages = ['', ...gardenIds].map((gardenId) =>
    locales
      .map((locale) => {
        const links = locales
          .map(
            (other) =>
              `    <xhtml:link rel="alternate" hreflang="${other}" href="${SITE_URL + routePath({ locale: other, gardenId })}"/>`,
          )
          .join('\n');
        return `  <url>\n    <loc>${SITE_URL + routePath({ locale, gardenId })}</loc>\n${links}\n  </url>`;
      })
      .join('\n'),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${pages.join('\n')}\n</urlset>\n`;
}
