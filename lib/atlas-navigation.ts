import type { GardenCategory, FilterId } from './gardens';

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

/** URL input is untrusted. Unknown IDs never become UI state. */
export function readAtlasUrl(
  url: URL,
  gardenIds: readonly string[],
): AtlasNavigation {
  const selected = url.searchParams.get('zahrada') ?? '';
  const category = url.searchParams.get('typ');
  return {
    query: (url.searchParams.get('q') ?? '').slice(0, 200),
    selectedId: gardenIds.includes(selected) ? selected : '',
    category: categoryIds.includes(category ?? '')
      ? (category as GardenCategory)
      : null,
    filters: [...new Set((url.searchParams.get('filtry') ?? '').split(','))]
      .filter((id): id is FilterId => filterIds.includes(id))
      .sort(),
  };
}

/** Preserve unrelated query parameters, but own the four atlas parameters. */
export function writeAtlasUrl(current: URL, state: AtlasNavigation): URL {
  const url = new URL(current);
  const values: Record<string, string> = {
    q: state.query,
    zahrada: state.selectedId,
    typ: state.category ?? '',
    filtry: [...new Set(state.filters)].sort().join(','),
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return url;
}

/** A garden share is independent of the sender's search and filters. */
export function gardenShareUrl(current: URL, id: string): URL {
  const url = new URL(current.origin + current.pathname);
  url.searchParams.set('zahrada', id);
  return url;
}
