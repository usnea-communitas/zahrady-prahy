import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync('src/fonts.css', 'utf8');
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
  ([, body]) => ({
    family: /font-family:\s*'([^']+)'/.exec(body)[1],
    file: /url\('([^']+)'\)/.exec(body)[1],
    ranges: /unicode-range:([^;]+);/
      .exec(body)[1]
      .split(',')
      .map((part) => {
        const [from, to = from] = part.trim().replace('U+', '').split('-');
        return [parseInt(from, 16), parseInt(to, 16)];
      }),
  }),
);

const covers = (family, codePoint) =>
  faces.some(
    (face) =>
      face.family === family &&
      face.ranges.some(([from, to]) => codePoint >= from && codePoint <= to),
  );

/** Every source file whose strings can appear on a page. */
function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sources(file);
    return /\.(ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}

await test('every font file the faces name exists', () => {
  assert.ok(faces.length >= 18);
  for (const face of faces)
    assert.ok(existsSync(path.join('public', face.file)), face.file);
});

await test('Inter covers every letter the atlas texts use', () => {
  // The latin-ext files hold only the Czech and Slovak letters (see the note
  // in src/fonts.css); a new garden name with another letter needs a new cut.
  const missing = new Set();
  for (const file of [
    ...sources('lib'),
    ...sources('app'),
    ...sources('components'),
    'src/entry-server.tsx',
  ]) {
    for (const character of readFileSync(file, 'utf8')) {
      if (!/\p{L}/u.test(character)) continue;
      if (!covers('Inter', character.codePointAt(0)))
        missing.add(`${character} (${file})`);
    }
  }
  assert.deepEqual([...missing], []);
});

await test('the Czech letters are in every family', () => {
  for (const family of ['Inter', 'Playfair Display', 'JetBrains Mono'])
    for (const letter of 'ČčĎďĚěŇňŘřŠšŤťŮůŽžÁáÉéÍíÓóÚúÝý')
      assert.ok(covers(family, letter.codePointAt(0)), `${family} ${letter}`);
});
