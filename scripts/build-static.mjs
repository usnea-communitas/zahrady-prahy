/**
 * Builds the static atlas into dist/ (npm run build):
 *
 * 1. the browser bundle (vite build),
 * 2. the server entry (src/entry-server.tsx), used only here,
 * 3. every page – the atlas and the 13 gardens, in English and Czech – as HTML
 *    with its own title, description, addresses, share preview and data,
 * 4. a 1200 × 630 share picture per garden from its illustration (dist/og/),
 *    the sitemap and a 404 page.
 *
 * It stops when vercel.json does not allow the one inline script by its hash.
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const run = (command) => execSync(command, { stdio: 'inherit' });

await rm('dist', { recursive: true, force: true });
run('npx vite build');
run('npx vite build --ssr src/entry-server.tsx --outDir .ssr');
const server = await import(
  pathToFileURL(path.resolve('.ssr/entry-server.js')).href
);

const scriptHash = `'sha256-${createHash('sha256').update(server.legacyRedirectScript).digest('base64')}'`;
const vercel = await readFile('vercel.json', 'utf8');
if (!vercel.includes(scriptHash)) {
  console.error(
    `vercel.json: the Content-Security-Policy must allow the head script of / with ${scriptHash} in script-src (the garden list changed?).`,
  );
  process.exit(1);
}

const template = await readFile('dist/index.html', 'utf8');
for (const marker of [
  '<html lang="en">',
  '<!--redirect-->',
  '<!--head-->',
  '<!--app-->',
]) {
  if (!template.includes(marker))
    throw new Error(`index.html has lost ${marker}`);
}

for (const route of server.routes) {
  const isRoot = route.locale === 'en' && !route.gardenId;
  const html = template
    .replace('<html lang="en">', `<html lang="${route.locale}">`)
    .replace(
      '<!--redirect-->',
      isRoot ? `<script>${server.legacyRedirectScript}</script>` : '',
    )
    .replace('<!--head-->', server.head(route))
    .replace('<!--app-->', server.render(route));
  const dir = path.join('dist', server.routePath(route));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);
}

// A plain page for addresses that do not exist; it loads no script.
const notFound = template
  .replace('<!--redirect-->', '')
  .replace(
    '<!--head-->',
    '<title>Page not found — Gardens of Prague</title>\n    <meta name="robots" content="noindex">',
  )
  .replace(/\s*<script type="module"[^>]*><\/script>/, '')
  .replace(
    '<!--app-->',
    '<main class="not-found"><h1>Page not found · Stránka nenalezena</h1><p><a href="/">Gardens of Prague</a> · <a href="/cs/">Zahrady Prahy</a></p></main>',
  );
await writeFile('dist/404.html', notFound);

await mkdir('dist/og', { recursive: true });
for (const { id, illustration } of server.shareImages) {
  await sharp(path.join('public', illustration))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`dist/og/${id}.jpg`);
}

await writeFile('dist/sitemap.xml', server.sitemap());
await rm('.ssr', { recursive: true, force: true });
console.log(
  `Built ${server.routes.length} pages, ${server.shareImages.length} share pictures, the sitemap and 404.html into dist/.`,
);
