/**
 * The home-screen icon (public/apple-touch-icon.png, 180 x 180) is a square
 * detail of the postcard illustration: the lit greenhouse in the garden.
 * The browser-tab icon is public/favicon.svg and needs no build step.
 *
 *   node scripts/build-icons.mjs
 */
import path from 'node:path';

import sharp from 'sharp';

const postcard = path.resolve('public/zahrady-prahy-postcard.webp');
const target = path.resolve('public/apple-touch-icon.png');

const { size } = await sharp(postcard)
  .extract({ left: 400, top: 196, width: 224, height: 224 })
  .resize(180, 180)
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(target);

console.log(`${path.relative(process.cwd(), target)}  ${size} B`);
