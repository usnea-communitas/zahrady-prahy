import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  gardens,
  artPositions,
  matchesSearch,
  normalizeSearch,
  filterOptions,
  navigationUrl,
} from '../lib/gardens.ts';

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
await test('every garden has sourced visit facts and explicit gaps', () => {
  const factsFor = (visit) =>
    [visit.access, visit.hours, visit.entrance, visit.participation].filter(
      Boolean,
    );

  for (const garden of gardens) {
    assert.ok(garden.visit);
    assert.equal(garden.visit.access.checkedAt, '6. 9. 2026');
    assert.equal(garden.visit.hours.checkedAt, '6. 9. 2026');
    for (const fact of factsFor(garden.visit)) {
      assert.ok(fact.text.length > 10);
      assert.ok(['published', 'not-found', 'not-checked'].includes(fact.state));
      assert.ok(fact.sources.length > 0);
      for (const source of fact.sources)
        assert.equal(new URL(source.url).protocol, 'https:');
    }
    for (const fact of factsFor(garden.visit).filter(
      (candidate) => candidate.state === 'published',
    ))
      assert.ok(fact.sources.length > 0);
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
  assert.ok(!page.includes('Tip jsme přijali'));
  assert.ok(!page.includes('name="gardenEmail"'));
  assert.ok(page.includes('Přijímání tipů připravujeme.'));
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
