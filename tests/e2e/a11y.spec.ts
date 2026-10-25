import { expect, test } from '@playwright/test';

import { openAtlas } from './atlas';

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
