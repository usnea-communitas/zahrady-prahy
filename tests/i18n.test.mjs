import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  LOCALE_STORAGE_KEY,
  defaultLocale,
  dictionaries,
  formatDate,
  isLocale,
  locales,
  plural,
  readStoredLocale,
} from '../lib/i18n.ts';

/** Every leaf of the English dictionary, as dotted paths. */
function leaves(value, prefix = '') {
  if (typeof value === 'string' || typeof value === 'function') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}
const get = (object, path) =>
  path.split('.').reduce((current, key) => current?.[key], object);

await test('English is the default and the only locales are en and cs', () => {
  assert.equal(defaultLocale, 'en');
  assert.deepEqual([...locales], ['en', 'cs']);
  assert.equal(LOCALE_STORAGE_KEY, 'zahrady.lang');
});
await test('the Czech dictionary mirrors every English key with the same value kind', () => {
  const keys = leaves(dictionaries.en);
  assert.ok(keys.length > 80);
  for (const key of keys) {
    const en = get(dictionaries.en, key);
    const cs = get(dictionaries.cs, key);
    assert.equal(typeof cs, typeof en, key);
    if (typeof en === 'string') assert.ok(cs.length > 0, key);
  }
  assert.deepEqual(leaves(dictionaries.cs), keys);
});
await test('no English string contains Czech diacritics except deliberate proper nouns', () => {
  const allowed = new Set(['langName']);
  for (const key of leaves(dictionaries.en)) {
    if (allowed.has(key)) continue;
    const value = get(dictionaries.en, key);
    const sample =
      typeof value === 'function' ? value('Name', 'Prague 1', 3) : value;
    assert.doesNotMatch(
      String(sample),
      /[ěščřžýáíéúůťďňĚŠČŘŽÝÁÍÉÚŮŤĎŇ]/,
      `${key}: ${sample}`,
    );
  }
});
await test('counted phrases agree with their number in both languages', () => {
  assert.equal(dictionaries.en.header.placesCount(1), '1 place');
  assert.equal(dictionaries.en.header.placesCount(13), '13 places');
  assert.equal(dictionaries.cs.header.placesCount(1), '1 místo');
  assert.equal(dictionaries.cs.header.placesCount(3), '3 místa');
  assert.equal(dictionaries.cs.header.placesCount(13), '13 míst');
  assert.equal(plural(0, { one: 'a', few: 'b', many: 'c' }), 'c');
  assert.equal(plural(5, { one: 'a', few: 'b', many: 'c' }), 'c');
  assert.equal(dictionaries.cs.footer.discovered(2), '2 objevená místa');
  assert.equal(dictionaries.en.footer.discovered(2), '2 places discovered');
});
await test('the verification date is formatted per language without touching the stored value', () => {
  assert.equal(formatDate('2026-09-06', 'cs'), '6. 9. 2026');
  assert.equal(formatDate('2026-09-06', 'en'), '6 September 2026');
  assert.equal(formatDate('2026-12-24', 'en'), '24 December 2026');
  assert.equal(formatDate('not a date', 'en'), 'not a date');
});
await test('only a valid stored language is honoured, and storage failures fall back to the default', () => {
  assert.equal(isLocale('cs'), true);
  assert.equal(isLocale('de'), false);
  assert.equal(isLocale(null), false);
  assert.equal(readStoredLocale({ getItem: () => 'cs' }), 'cs');
  assert.equal(readStoredLocale({ getItem: () => 'de' }), null);
  assert.equal(readStoredLocale({ getItem: () => null }), null);
  assert.equal(
    readStoredLocale({
      getItem: () => {
        throw new Error('blocked');
      },
    }),
    null,
  );
});
await test('the document is served in English and the switcher is wired into the header', () => {
  const layout = readFileSync(
    new URL('../app/layout.tsx', import.meta.url),
    'utf8',
  );
  const page = readFileSync(
    new URL('../app/page.tsx', import.meta.url),
    'utf8',
  );
  assert.ok(layout.includes('<html lang={defaultLocale}>'));
  assert.ok(layout.includes("locale: 'en_US'"));
  assert.ok(layout.includes('og:locale:alternate'));
  assert.ok(layout.includes('<LocaleProvider>'));
  assert.ok(page.includes('<LanguageSwitcher />'));
});
