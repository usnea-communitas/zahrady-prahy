/**
 * Titles, descriptions and structured data of each page, shared by the static
 * build (scripts/build-static.mjs) and the browser, which keeps the title in
 * step when a garden or the language changes without a new page load.
 */
import type { Garden } from './gardens.ts';
import { dictionaries, pick, type Locale } from './i18n.ts';
import { SITE_URL, routePath } from './routes.ts';

export function pageTitle(locale: Locale, garden?: Garden | null): string {
  const meta = dictionaries[locale].meta;
  return garden ? `${garden.name} — ${meta.siteName}` : meta.title;
}

/** A garden's description up to its first full stop past 80 characters. */
export function pageDescription(
  locale: Locale,
  garden?: Garden | null,
): string {
  if (!garden) return dictionaries[locale].meta.description;
  const text = pick(garden.description, locale);
  const stop = text.indexOf('. ', 80);
  return stop > 0 && stop < 220 ? text.slice(0, stop + 1) : text;
}

export function shareImage(garden?: Garden | null) {
  return garden
    ? { url: `${SITE_URL}/og/${garden.id}.jpg`, width: 1200, height: 630 }
    : { url: `${SITE_URL}/zahrady-prahy-og.jpg`, width: 1200, height: 630 };
}

/** schema.org data for the atlas: the list of its gardens, each with its page. */
export function atlasStructuredData(
  locale: Locale,
  gardens: readonly Garden[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: dictionaries[locale].meta.title,
    url: SITE_URL + routePath({ locale, gardenId: '' }),
    numberOfItems: gardens.length,
    itemListElement: gardens.map((garden, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: garden.name,
      url: SITE_URL + routePath({ locale, gardenId: garden.id }),
    })),
  };
}

/** schema.org data for a garden page: what the catalogue states, nothing more.
 * Coordinates are left out where the catalogue marks them as approximate. */
export function gardenStructuredData(locale: Locale, garden: Garden) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: garden.name,
    description: pick(garden.description, locale),
    url: SITE_URL + routePath({ locale, gardenId: garden.id }),
    image: shareImage(garden).url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: garden.district,
      addressRegion: pick(garden.area, locale),
      addressCountry: 'CZ',
    },
    ...(garden.locationStatus
      ? {}
      : {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: garden.lat,
            longitude: garden.lon,
          },
        }),
    sameAs: garden.sourceUrl,
  };
}
