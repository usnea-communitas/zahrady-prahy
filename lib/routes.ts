/**
 * Addresses of the static atlas. Every page exists in both languages:
 *
 *   /                      the atlas in English (the default)
 *   /cs/                   the atlas in Czech
 *   /zahrada/<id>/         one garden, English
 *   /cs/zahrada/<id>/      one garden, Czech
 *
 * The garden segment keeps the Czech word of the older `?zahrada=` links.
 * Search and filters stay query parameters (`?q=`, `?typ=`, `?filtry=`).
 */
import { defaultLocale, isLocale, locales, type Locale } from './i18n.ts';

export const SITE_URL = 'https://zahrady-prahy.vercel.app';
export const GARDEN_SEGMENT = 'zahrada';

export type Route = { locale: Locale; gardenId: string };

/** The path of a page, always with a trailing slash. */
export function routePath({ locale, gardenId }: Route): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return gardenId ? `${prefix}/${GARDEN_SEGMENT}/${gardenId}/` : `${prefix}/`;
}

/** Path input is untrusted: an unknown garden becomes the atlas itself. */
export function parseRoutePath(
  pathname: string,
  gardenIds: readonly string[],
): Route {
  const parts = pathname.split('/').filter(Boolean);
  let locale: Locale = defaultLocale;
  if (isLocale(parts[0]) && parts[0] !== defaultLocale) {
    locale = parts[0];
    parts.shift();
  }
  const gardenId =
    parts[0] === GARDEN_SEGMENT && parts[1] && gardenIds.includes(parts[1])
      ? parts[1]
      : '';
  return { locale, gardenId };
}

/**
 * A click the atlas handles in place: the main button with no key held. A held
 * key or another button lets the browser open the link its own way (a new tab
 * or window), so every page link still works as a link.
 */
export function isPlainClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented?: boolean;
}): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  );
}

/** Every page the build writes: the atlas and each garden, in each language. */
export function allRoutes(gardenIds: readonly string[]): Route[] {
  return locales.flatMap((locale) =>
    ['', ...gardenIds].map((gardenId) => ({ locale, gardenId })),
  );
}
