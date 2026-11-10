// Z-01 trial: build the client, build the server entry, render "/" into dist-static/index.html.
import { execSync } from 'node:child_process';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
execSync('npx vite build -c vite.static.config.ts', { stdio: 'inherit' });
execSync('npx vite build -c vite.static.config.ts --ssr src/entry-server.tsx --outDir dist-static-ssr', { stdio: 'inherit' });
const { render } = await import(pathToFileURL('dist-static-ssr/entry-server.js').href);
const template = await readFile('dist-static/index.html', 'utf8');
await writeFile('dist-static/index.html', template.replace('<!--app-->', render()));
await rm('dist-static-ssr', { recursive: true });
console.log('prerendered dist-static/index.html');
