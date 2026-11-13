import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readAtlasUrl,
  writeAtlasUrl,
  gardenShareUrl,
} from '../lib/atlas-navigation.ts';
import {
  allRoutes,
  isPlainClick,
  parseRoutePath,
  routePath,
} from '../lib/routes.ts';

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
    'en',
  );
  assert.equal(url.pathname, '/zahrada/metrofarm/');
  assert.deepEqual(readAtlasUrl(url, ['metrofarm']), state);
  assert.equal(url.searchParams.get('campaign'), 'atlas');
});
await test('malformed links cannot introduce invalid IDs or duplicate filters', () => {
  const url = new URL(
    'https://example.test/zahrada/missing/?typ=invalid&filtry=events,invalid,events,compost&q=' +
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
      'https://example.test/cs/zahrada/liboza/?typ=community&q=liboza&filtry=compost',
    ),
    { query: '', selectedId: '', category: null, filters: [] },
    'cs',
  );
  assert.equal(url.pathname, '/cs/');
  assert.equal(url.search, '');
});
await test('garden shares never carry incompatible filters or search', () => {
  const url = gardenShareUrl(
    new URL('https://example.test/?q=elsewhere&typ=nature#garden-list'),
    'liboza',
    'en',
  );
  assert.equal(url.href, 'https://example.test/zahrada/liboza/');
});
await test('a garden share opens in the language it was sent from', () => {
  assert.equal(
    gardenShareUrl(
      new URL('https://example.test/cs/zahrada/prales/?q=liboza'),
      'liboza',
      'cs',
    ).href,
    'https://example.test/cs/zahrada/liboza/',
  );
  // English is the default and has no prefix.
  assert.equal(
    gardenShareUrl(new URL('https://example.test/'), 'liboza', 'en').href,
    'https://example.test/zahrada/liboza/',
  );
});
await test('older ?zahrada=, ?garden= and ?lang= links are read and written away', () => {
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
    new URL('https://example.test/?garden=liboza&lang=cs'),
    state,
    'cs',
  );
  assert.equal(clean.href, 'https://example.test/cs/zahrada/liboza/');
  assert.equal(
    readAtlasUrl(new URL('https://example.test/?garden=missing'), ['liboza'])
      .selectedId,
    '',
  );
});
await test('page addresses: language prefix, garden segment, trailing slash', () => {
  const ids = ['prales', 'liboza'];
  assert.equal(routePath({ locale: 'en', gardenId: '' }), '/');
  assert.equal(routePath({ locale: 'cs', gardenId: '' }), '/cs/');
  assert.equal(
    routePath({ locale: 'en', gardenId: 'prales' }),
    '/zahrada/prales/',
  );
  assert.equal(
    routePath({ locale: 'cs', gardenId: 'prales' }),
    '/cs/zahrada/prales/',
  );
  assert.deepEqual(parseRoutePath('/cs/zahrada/liboza/', ids), {
    locale: 'cs',
    gardenId: 'liboza',
  });
  assert.deepEqual(parseRoutePath('/zahrada/unknown/', ids), {
    locale: 'en',
    gardenId: '',
  });
  assert.deepEqual(parseRoutePath('/en/', ids), { locale: 'en', gardenId: '' });
  assert.equal(allRoutes(ids).length, 6);
});

await test('a plain click stays in the atlas, a held key or another button opens the link', () => {
  const click = (extra = {}) => ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...extra,
  });
  assert.equal(isPlainClick(click()), true);
  for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'])
    assert.equal(isPlainClick(click({ [key]: true })), false, key);
  assert.equal(isPlainClick(click({ button: 1 })), false, 'middle button');
  assert.equal(isPlainClick(click({ defaultPrevented: true })), false);
});
