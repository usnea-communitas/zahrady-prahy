/**
 * Serves the production build in .vercel/output the way Vercel routes it:
 * a static file when one exists, otherwise the server function. Used by the
 * browser tests (playwright.config.ts) so they check what gets deployed.
 *
 *   VERCEL=1 npm run build:vercel && node scripts/serve-vercel-output.mjs
 *
 * PORT selects the port (default 4173). Development tooling only.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';

const root = path.resolve('.vercel/output');
const staticRoot = path.join(root, 'static');
const port = Number(process.env.PORT ?? 4173);

if (!existsSync(path.join(root, 'config.json'))) {
  console.error('No build found. Run `VERCEL=1 npm run build:vercel` first.');
  process.exit(1);
}

const handler = (
  await import(
    pathToFileURL(path.join(root, 'functions/__server.func/index.mjs')).href
  )
).default;

const contentTypes = {
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
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function staticFile(pathname) {
  const file = path.join(staticRoot, decodeURIComponent(pathname));
  if (!file.startsWith(staticRoot + path.sep)) return null;
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
    const file = staticFile(url.pathname);
    if (file) {
      const { size } = statSync(file);
      const headers = {
        'content-type':
          contentTypes[path.extname(file)] ?? 'application/octet-stream',
        'accept-ranges': 'bytes',
      };
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? '');
      if (range) {
        const start = range[1] ? Number(range[1]) : 0;
        const end = range[2] ? Number(range[2]) : size - 1;
        response.writeHead(206, {
          ...headers,
          'content-length': end - start + 1,
          'content-range': `bytes ${start}-${end}/${size}`,
        });
        createReadStream(file, { start, end }).pipe(response);
        return;
      }
      response.writeHead(200, { ...headers, 'content-length': size });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file).pipe(response);
      return;
    }
    const result = await handler.fetch(
      new Request(url, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method ?? 'GET')
          ? undefined
          : Readable.toWeb(request),
        duplex: 'half',
      }),
      {},
    );
    response.writeHead(result.status, Object.fromEntries(result.headers));
    if (result.body) Readable.fromWeb(result.body).pipe(response);
    else response.end();
  } catch (error) {
    console.error(error);
    response.writeHead(500).end('Internal error');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving .vercel/output on http://127.0.0.1:${port}`);
});
