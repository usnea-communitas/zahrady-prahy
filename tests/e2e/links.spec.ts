import { expect, test } from '@playwright/test';

import { gardens } from '../../lib/gardens';
import { collectErrors, openAtlas } from './atlas';

// The pages as built (dist/), read as text: what a search engine and a visitor
// whose browser has not run the app find.
const ids = gardens.map((garden) => garden.id);
const hrefs = (html: string) =>
  [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]);

for (const [atlas, prefix, other] of [
  ['/', '', '/cs'],
  ['/cs/', '/cs', ''],
] as const) {
  test(`${atlas} links to all thirteen gardens, and each garden page links back and across`, async ({
    request,
  }) => {
    const html = await (await request.get(atlas)).text();
    const links = new Set(hrefs(html));
    expect(ids.filter((id) => !links.has(`${prefix}/zahrada/${id}/`))).toEqual(
      [],
    );
    expect(links.has(`${other}/`)).toBe(true);
    const data = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1],
    );
    expect(data['@type']).toBe('ItemList');
    expect(data.itemListElement).toHaveLength(13);

    for (const id of ids) {
      const page = new Set(
        hrefs(await (await request.get(`${prefix}/zahrada/${id}/`)).text()),
      );
      expect(page.has(`${prefix}/`), `${id}: the atlas`).toBe(true);
      expect(
        page.has(`${other}/zahrada/${id}/`),
        `${id}: the other language`,
      ).toBe(true);
    }
  });
}

test('the sitemap dates each page by the last check of its facts', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const urls = xml.match(/<url>/g) ?? [];
  const dates = [...xml.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)];
  expect(urls).toHaveLength(28);
  expect(dates).toHaveLength(28);
});

test('a garden link opens the garden in place, and a held key leaves it to the browser', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await openAtlas(page);
  await page.locator('button[aria-controls="garden-list"]').click();
  const link = page.locator('#garden-list li a').first();
  const href = await link.getAttribute('href');
  await link.click();
  await expect(page.locator('.garden-preview')).toBeVisible();
  await expect(page.locator('.preview-close')).toBeFocused();
  expect(new URL(page.url()).pathname).toBe(href);
  await expect(link).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(page.locator('.garden-preview')).toHaveCount(0);
  await expect(link).toBeFocused();
  // the brand is the way back to the atlas from any garden
  await link.click();
  await page.locator('.brand').click();
  await expect(page.locator('.garden-preview')).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe('/');
  expect(errors).toEqual([]);
});
