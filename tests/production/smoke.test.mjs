// Production smoke test: is the live atlas up, and does it work in both languages?
// Run after a deployment (.github/workflows/production-smoke.yml) or by hand:
// npm run test:production (PROD_URL overrides the address).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const site = new URL(
  process.env.PROD_URL || 'https://zahrady-prahy.vercel.app/',
);
let browser;

async function open(path, viewport, mobile = false) {
  browser ??= await chromium.launch();
  const page = await browser.newPage({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
  });
  page.setDefaultTimeout(20000);
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.url().startsWith(site.origin) && response.status() >= 400)
      problems.push(`http ${response.status()}: ${response.url()}`);
  });
  await page.goto(new URL(path, site).href, { waitUntil: 'load' });
  await page.locator('.garden-marker').first().waitFor();
  return { page, problems };
}

await test(`${site.host} answers with the atlas`, async () => {
  const response = await fetch(site, {
    headers: { 'cache-control': 'no-cache' },
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Zahrady Prahy/);
});

await test('security headers, icons, sitemap and the share preview', async () => {
  const response = await fetch(site, {
    headers: { 'cache-control': 'no-cache' },
  });
  const header = (name) => response.headers.get(name) ?? '';
  assert.equal(header('x-content-type-options'), 'nosniff');
  assert.equal(header('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(header('x-frame-options'), 'SAMEORIGIN');
  assert.match(header('permissions-policy'), /camera=\(\)/);
  assert.match(header('content-security-policy'), /frame-ancestors 'self'/);
  const html = await response.text();
  const preview =
    html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? '';
  assert.match(preview, /^https:\/\//, 'og:image is an absolute address');
  assert.equal((await fetch(preview)).status, 200, `GET ${preview}`);
  for (const path of ['/favicon.ico', '/robots.txt', '/sitemap.xml']) {
    assert.equal((await fetch(new URL(path, site))).status, 200, `GET ${path}`);
  }
});

await test('the Czech atlas and each garden page exist with their share pictures', async () => {
  for (const [path, picture] of [
    ['/cs/', '/zahrady-prahy-og.jpg'],
    ['/zahrada/prales/', '/og/prales.jpg'],
    ['/cs/zahrada/prales/', '/og/prales.jpg'],
  ]) {
    const response = await fetch(new URL(path, site), {
      headers: { 'cache-control': 'no-cache' },
    });
    assert.equal(response.status, 200, `GET ${path}`);
    assert.match(
      response.headers.get('content-security-policy') ?? '',
      /script-src 'self'/,
    );
    const html = await response.text();
    const image =
      html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? '';
    assert.ok(image.endsWith(picture), `${path}: og:image ${image}`);
    assert.equal((await fetch(new URL(picture, site))).status, 200, picture);
  }
});

await test('all 13 gardens are on the map and one opens, with no errors', async () => {
  const { page, problems } = await open('/', { width: 1440, height: 900 });
  assert.equal(await page.locator('.garden-marker').count(), 13);
  await page.locator('.garden-marker').first().click();
  await page.locator('.garden-preview').waitFor();
  assert.deepEqual(problems, []);
  await page.close();
});

await test('a ?lang=cs link opens a garden in Czech on a phone', async () => {
  const { page, problems } = await open(
    '/?lang=cs&zahrada=prales',
    { width: 390, height: 844 },
    true,
  );
  await page.locator('.garden-preview').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'cs');
  assert.match(
    await page.locator('.garden-preview').innerText(),
    /Otevřít v mapě/,
  );
  assert.deepEqual(problems, []);
  await page.close();
});

// The tests are awaited one by one, so this runs after the last of them.
await browser?.close();
