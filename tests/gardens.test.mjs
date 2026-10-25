import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  gardens,
  artPositions,
  categoryLabels,
  matchesSearch,
  normalizeSearch,
  filterOptions,
  navigationUrl,
  tagLabels,
  thumbnailUrl,
} from '../lib/gardens.ts';
import { GARDEN_VISIT_CHECKED_AT } from '../lib/garden-visits.ts';
import { locales } from '../lib/i18n.ts';

const isBilingual = (value) =>
  value &&
  typeof value === 'object' &&
  locales.every(
    (locale) => typeof value[locale] === 'string' && value[locale].length > 0,
  );

await test('all 13 gardens have unique IDs, real coordinates and existing illustrations', () => {
  assert.equal(gardens.length, 13);
  assert.equal(
    new Set(gardens.map((garden) => garden.id)).size,
    gardens.length,
  );
  for (const garden of gardens) {
    assert.ok(garden.lat > 49.9 && garden.lat < 50.3);
    assert.ok(garden.lon > 14.1 && garden.lon < 14.8);
    assert.ok(
      existsSync(new URL('../public' + garden.illustration, import.meta.url)),
    );
    assert.equal(new URL(garden.sourceUrl).protocol, 'https:');
    assert.ok(garden.artPosition.x > 5 && garden.artPosition.x < 95);
    assert.ok(garden.artPosition.y > 5 && garden.artPosition.y < 95);
  }
  assert.equal(Object.keys(artPositions).length, gardens.length);
});
await test('every garden has a small list thumbnail', () => {
  for (const garden of gardens) {
    const file = new URL('../public' + thumbnailUrl(garden), import.meta.url);
    assert.ok(
      existsSync(file),
      `${garden.id}: run scripts/build-thumbnails.mjs`,
    );
    assert.ok(readFileSync(file).length < 20_000, garden.id);
  }
});
await test('every reader-facing catalogue field exists in both languages', () => {
  for (const garden of gardens) {
    assert.ok(isBilingual(garden.description), garden.id);
    assert.ok(isBilingual(garden.area), garden.id);
    if (garden.locationStatus) assert.ok(isBilingual(garden.locationStatus));
    for (const tag of garden.tags) assert.ok(isBilingual(tagLabels[tag]), tag);
    assert.ok(isBilingual(categoryLabels[garden.category]));
  }
  for (const option of filterOptions) assert.ok(isBilingual(option.label));
});
await test('every garden has sourced visit facts and explicit gaps', () => {
  const factsFor = (visit) =>
    [visit.access, visit.hours, visit.entrance, visit.participation].filter(
      Boolean,
    );

  assert.match(GARDEN_VISIT_CHECKED_AT, /^\d{4}-\d{2}-\d{2}$/);
  for (const garden of gardens) {
    assert.ok(garden.visit);
    assert.equal(garden.visit.access.checkedAt, GARDEN_VISIT_CHECKED_AT);
    assert.equal(garden.visit.hours.checkedAt, GARDEN_VISIT_CHECKED_AT);
    for (const fact of factsFor(garden.visit)) {
      assert.ok(isBilingual(fact.text), garden.id);
      for (const locale of locales) assert.ok(fact.text[locale].length > 10);
      if (fact.appliesTo) assert.ok(isBilingual(fact.appliesTo), garden.id);
      assert.ok(['published', 'not-found', 'not-checked'].includes(fact.state));
      assert.ok(fact.sources.length > 0);
      for (const source of fact.sources) {
        assert.equal(new URL(source.url).protocol, 'https:');
        assert.ok(isBilingual(source.label), source.url);
      }
    }
  }
});
await test('an admitted gap in one language is never filled in the other', () => {
  // A `not-found` hours fact says "we did not find" in both languages, so a
  // translation can never turn an honest gap into an invented schedule.
  for (const garden of gardens) {
    const fact = garden.visit.hours;
    if (fact.state !== 'not-found') continue;
    assert.match(fact.text.cs, /nenašli/, garden.id);
    assert.match(fact.text.en, /did not find/, garden.id);
  }
});
await test('search is accent-insensitive, case-insensitive and matches words in any order', () => {
  assert.equal(normalizeSearch('  LIBÓZA ŽIŽKOV  '), 'liboza zizkov');
  assert.equal(
    gardens.filter((garden) => matchesSearch(garden, 'liboza'))[0]?.id,
    'liboza',
  );
  assert.equal(
    gardens.filter((garden) => matchesSearch(garden, '13 prokopka'))[0]?.id,
    'prokopka',
  );
  assert.equal(
    gardens.filter((garden) => matchesSearch(garden, '   ')).length,
    13,
  );
  assert.equal(
    gardens.filter((garden) => matchesSearch(garden, 'neexistujici misto'))
      .length,
    0,
  );
});
await test('search understands Czech and English words alike', () => {
  const ids = (query) =>
    gardens.filter((garden) => matchesSearch(garden, query)).map((g) => g.id);
  assert.deepEqual(ids('bezbariérové'), ['prales']);
  assert.deepEqual(ids('wheelchair'), ['prales']);
  assert.deepEqual(ids('Prague 7').sort(), ['metrofarm', 'prazelenina']);
  assert.deepEqual(ids('praha 7').sort(), ['metrofarm', 'prazelenina']);
  assert.ok(ids('urban farm').includes('metrofarm'));
  assert.ok(ids('mestska farma').includes('metrofarm'));
});
await test('compost includes MetroFarm and courtyard does not include Vidimova', () => {
  const metrofarm = gardens.find((garden) => garden.id === 'metrofarm');
  assert.ok(
    filterOptions.find((filter) => filter.id === 'compost').matches(metrofarm),
  );
  assert.equal(
    gardens.find((garden) => garden.id === 'vidimova').category,
    'community',
  );
});
await test('navigation uses geographic coordinates, never the artistic marker position', () => {
  for (const garden of gardens) {
    const link = new URL(navigationUrl(garden));
    assert.equal(link.searchParams.get('query'), `${garden.lat},${garden.lon}`);
  }
});
await test('western and eastern places stay on their respective sides of the illustrated river', () => {
  for (const id of ['liboza', 'na-plani', 'prokopka'])
    assert.ok(artPositions[id].x < 35);
  for (const id of ['kotlaska', 'mecislavka', 'vidimova', 'zizkovska-zahradka'])
    assert.ok(artPositions[id].x > 55);
});
await test('no fake submission confirmation or personal-data collection remains', () => {
  const page = readFileSync(
    new URL('../app/page.tsx', import.meta.url),
    'utf8',
  );
  const dictionary = readFileSync(
    new URL('../lib/i18n.ts', import.meta.url),
    'utf8',
  );
  assert.ok(!page.includes('Tip jsme přijali'));
  assert.ok(!dictionary.includes('Tip jsme přijali'));
  assert.ok(!page.includes('name="gardenEmail"'));
  assert.ok(page.includes('t.addDialog.title'));
  assert.ok(dictionary.includes('Přijímání tipů připravujeme.'));
  assert.ok(dictionary.includes('Suggestions are being prepared.'));
});
await test('boat corridor uses a stroked luminance mask rather than stroke inside clipPath', () => {
  const layer = readFileSync(
    new URL('../components/map/MapMotionLayer.tsx', import.meta.url),
    'utf8',
  );
  assert.ok(layer.includes('<mask'));
  assert.ok(layer.includes('stroke="white"'));
  assert.ok(!layer.includes('<clipPath'));
});
