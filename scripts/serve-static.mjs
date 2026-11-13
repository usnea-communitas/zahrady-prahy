/**
 * Serves dist/ the way Vercel does with vercel.json: a folder by its
 * index.html, addresses without a trailing slash redirected (308), unknown
 * addresses as 404.html with status 404, and the headers from vercel.json
 * (so the browser tests run under the same Content-Security-Policy).
 *
 *   npm run build && node scripts/serve-static.mjs    (PORT, default 4173)
 */
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.env.PORT ?? 4173);
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const rules = vercel.headers.map(({ source, headers }) => ({
  pattern: new RegExp('^' + source.replace(/\(\.\*\)/g, '.*') + '$'),
  headers,
}));
const types = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const headers = {};
  for (const rule of rules)
    if (rule.pattern.test(pathname))
      for (const { key, value } of rule.headers) headers[key] = value;
  let file = path.join(root, pathname);
  if (!file.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  if (
    !path.extname(pathname) &&
    !pathname.endsWith('/') &&
    (await isFile(path.join(file, 'index.html')))
  ) {
    response
      .writeHead(308, { ...headers, Location: pathname + '/' + url.search })
      .end();
    return;
  }
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  let status = 200;
  if (!(await isFile(file))) {
    file = path.join(root, '404.html');
    status = 404;
  }
  const body = await readFile(file);
  response.writeHead(status, {
    ...headers,
    'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(port, '127.0.0.1', () =>
  console.log(`Serving dist/ on http://127.0.0.1:${port}/`),
);
