import { gardens, matchesSearch, navigationUrl } from '@/lib/gardens';

type ModelContext = {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ): void | Promise<void>;
};

/** Optional, read-only access to the same garden catalogue as the visible map. */
export function registerGardenSearch() {
  const context = (document as Document & { modelContext?: ModelContext })
    .modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  try {
    void Promise.resolve(
      context.registerTool(
        {
          name: 'search_prague_gardens',
          description:
            'Search the garden catalogue by Czech name, district or feature. Returns source and geographic map links. Does not submit suggestions or change the map.',
          inputSchema: {
            type: 'object',
            properties: { query: { type: 'string', maxLength: 200 } },
            required: ['query'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute(input) {
            if (
              !input ||
              typeof input !== 'object' ||
              !('query' in input) ||
              typeof input.query !== 'string' ||
              input.query.length > 200 ||
              Object.keys(input).some((key) => key !== 'query')
            )
              throw new Error(
                'Expected only a query string of at most 200 characters.',
              );
            const query = input.query;
            return gardens
              .filter((garden) => matchesSearch(garden, query))
              .map((garden) => ({
                id: garden.id,
                name: garden.name,
                district: garden.district,
                description: garden.description,
                source: garden.sourceUrl,
                mapUrl: navigationUrl(garden),
                locationNote:
                  garden.locationStatus ??
                  'Public-source coordinates; entrance and access not independently verified.',
              }));
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {
      /* Optional browser API. */
    });
  } catch {
    /* Browsers without this experimental API keep the normal UI. */
  }
  return () => lifecycle.abort();
}
