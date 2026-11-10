import type { GardenCategory, FilterId } from './gardens';
import type { Locale } from './i18n.ts';
import { parseRoutePath, routePath } from './routes.ts';

export type AtlasNavigation = {
  query: string;
  selectedId: string;
  category: GardenCategory | null;
  filters: FilterId[];
};

export const emptyNavigation: AtlasNavigation = {
  query: '',
  selectedId: '',
  category: null,
  filters: [],
};
const categoryIds = [
  'community',
  'urban-farm',
  'education',
  'courtyard',
  'nature',
];
const filterIds = ['children', 'accessible', 'compost', 'events'];

/** Older links named the garden in the query (`?zahrada=`, the English alias
 * `?garden=`) and the language in `?lang=`. A small script in the head of `/`
 * turns them into page addresses before anything renders; they are still read
 * here and always written away. */
export const GARDEN_PARAM = 'zahrada';
export const GARDEN_PARAM_ALIAS = 'garden';
const LEGACY_PARAMS = [GARDEN_PARAM, GARDEN_PARAM_ALIAS, 'lang'];

/** URL input is untrusted. Unknown IDs never become UI state. */
export function readAtlasUrl(
  url: URL,
  gardenIds: readonly string[],
): AtlasNavigation {
  const legacy =
    url.searchParams.get(GARDEN_PARAM) ??
    url.searchParams.get(GARDEN_PARAM_ALIAS) ??
    '';
  const selected =
    parseRoutePath(url.pathname, gardenIds).gardenId ||
    (gardenIds.includes(legacy) ? legacy : '');
  const category = url.searchParams.get('typ');
  return {
    query: (url.searchParams.get('q') ?? '').slice(0, 200),
    selectedId: selected,
    category: categoryIds.includes(category ?? '')
      ? (category as GardenCategory)
      : null,
    filters: [...new Set((url.searchParams.get('filtry') ?? '').split(','))]
      .filter((id): id is FilterId => filterIds.includes(id))
      .sort(),
  };
}

/** The garden and the language are the page address; search and filters
 * stay query parameters, and unrelated parameters are preserved. */
export function writeAtlasUrl(
  current: URL,
  state: AtlasNavigation,
  locale: Locale,
): URL {
  const url = new URL(current);
  url.pathname = routePath({ locale, gardenId: state.selectedId });
  const values: Record<string, string> = {
    q: state.query,
    typ: state.category ?? '',
    filtry: [...new Set(state.filters)].sort().join(','),
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  for (const key of LEGACY_PARAMS) url.searchParams.delete(key);
  return url;
}

/** A garden share is independent of the sender's search and filters, but
 * opens in the language it was sent from: `/zahrada/<id>/` or
 * `/cs/zahrada/<id>/`. */
export function gardenShareUrl(current: URL, id: string, locale: Locale): URL {
  return new URL(routePath({ locale, gardenId: id }), current.origin);
}
