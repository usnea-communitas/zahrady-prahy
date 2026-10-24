import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readAtlasUrl,
  writeAtlasUrl,
  gardenShareUrl,
} from '../lib/atlas-navigation.ts';

await test('search, filters, category and selected garden round-trip together', () => {
  const state = {
    query: 'záhony Praha',
    selectedId: 'metrofarm',
    category: 'urban-farm',
    filters: ['compost', 'events'],
  };
  const url = writeAtlasUrl(
    new URL('https://example.test/?campaign=atlas'),
    state,
  );
  assert.deepEqual(readAtlasUrl(url, ['metrofarm']), state);
  assert.equal(url.searchParams.get('campaign'), 'atlas');
});
await test('malformed links cannot introduce invalid IDs or duplicate filters', () => {
  const url = new URL(
    'https://example.test/?zahrada=missing&typ=invalid&filtry=events,invalid,events,compost&q=' +
      'x'.repeat(400),
  );
  const state = readAtlasUrl(url, ['metrofarm']);
  assert.equal(state.selectedId, '');
  assert.equal(state.category, null);
  assert.deepEqual(state.filters, ['compost', 'events']);
  assert.equal(state.query.length, 200);
});
await test('clearing selection and filters removes stale URL parameters', () => {
  const url = writeAtlasUrl(
    new URL(
      'https://example.test/?zahrada=liboza&typ=community&q=liboza&filtry=compost',
    ),
    { query: '', selectedId: '', category: null, filters: [] },
  );
  assert.equal(url.search, '');
});
await test('garden shares never carry incompatible filters or search', () => {
  const url = gardenShareUrl(
    new URL('https://example.test/?q=elsewhere&typ=nature#garden-list'),
    'liboza',
  );
  assert.equal(url.href, 'https://example.test/?zahrada=liboza');
});
await test('?garden= is accepted as an alias of ?zahrada= and normalised away', () => {
  const state = readAtlasUrl(new URL('https://example.test/?garden=liboza'), [
    'liboza',
  ]);
  assert.equal(state.selectedId, 'liboza');
  // The canonical parameter wins when both are present.
  assert.equal(
    readAtlasUrl(
      new URL('https://example.test/?zahrada=prales&garden=liboza'),
      ['liboza', 'prales'],
    ).selectedId,
    'prales',
  );
  const clean = writeAtlasUrl(
    new URL('https://example.test/?garden=liboza'),
    state,
  );
  assert.equal(clean.href, 'https://example.test/?zahrada=liboza');
  assert.equal(
    readAtlasUrl(new URL('https://example.test/?garden=missing'), ['liboza'])
      .selectedId,
    '',
  );
});
