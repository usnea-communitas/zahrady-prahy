/**
 * Smaller copies of the garden illustrations for the garden panel (Z-13).
 * The panel shows an illustration at most about 440 px wide, so a laptop with
 * an ordinary screen needs a third of the original's pixels: next to each
 * 1000 px original, `-640` and `-800` copies. The panel names all three and
 * the browser takes the one that matches the screen's pixel density
 * (illustrationSrcSet in lib/gardens.ts); 2× and 3× phones still get the
 * original.
 *
 * Run after adding or replacing an illustration:
 *   node scripts/build-illustration-sizes.mjs
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const directory = path.resolve('public/gardens');
const illustrations = (await readdir(directory))
  .filter((file) => file.endsWith('-illustrated.webp'))
  .sort();

for (const file of illustrations) {
  for (const width of [640, 800]) {
    const target = path.join(
      directory,
      file.replace(/\.webp$/, `-${width}.webp`),
    );
    // Resize first, then encode once, so the copy is not compressed twice.
    const resized = await sharp(path.join(directory, file))
      .resize({ width, kernel: 'lanczos3' })
      .png()
      .toBuffer();
    const { size } = await sharp(resized)
      .webp({ quality: 78, effort: 6, smartSubsample: true })
      .toFile(target);
    console.log(`${path.relative(process.cwd(), target)}  ${size} B`);
  }
}
