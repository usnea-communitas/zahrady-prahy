import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { openAtlas } from './atlas';

/** Serious and critical axe findings, one line per element. */
async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .flatMap(({ id, nodes }) =>
      nodes.map((node) => `${id}: ${node.target.join(' ')}`),
    );
}

const states = [
  ['at the start', '/'],
  ['with a garden open', '/?zahrada=kotlaska'],
  ['with the list open', '/?filtry=compost'],
] as const;

for (const locale of ['en', 'cs'] as const)
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ] as const)
    for (const [state, path] of states)
      test(`axe finds nothing serious ${state} (${locale}, ${width}×${height})`, async ({
        page,
      }) => {
        await page.addInitScript((choice) => {
          localStorage.setItem('zahrady.lang', choice);
        }, locale);
        await page.setViewportSize({ width, height });
        await openAtlas(page, path);
        expect(await seriousViolations(page)).toEqual([]);
      });

test('the keyboard moves through the page in the order it is seen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAtlas(page);
  const regions: string[] = [];
  for (let step = 0; step < 60 && regions.at(-1) !== 'footer'; step++) {
    await page.keyboard.press('Tab');
    const region = await page.evaluate(() => {
      const focused = document.activeElement;
      const groups: [string, string][] = [
        ['.skip-link', 'skip link'],
        ['.gallery-caption', 'title row'],
        ['.map-header', 'header'],
        ['.map-plane', 'map'],
        ['.map-navigation', 'map controls'],
        ['.map-footer', 'footer'],
      ];
      return (
        groups.find(([selector]) => focused?.closest(selector))?.[1] ??
        focused?.tagName ??
        'nothing'
      );
    });
    if (regions.at(-1) !== region) regions.push(region);
  }
  expect(regions).toEqual([
    'skip link',
    'title row',
    'header',
    'map',
    'map controls',
    'footer',
  ]);
});
