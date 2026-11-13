import { expect, test, type Page } from '@playwright/test';

import { gardens } from '../../lib/gardens';
import { openAtlas } from './atlas';

/*
 * Every text fits (S-18): in both languages, on phones 320 to 430 px wide, a
 * phone held sideways and two laptop windows, the header, the postcard, the
 * filters, all thirteen garden panels and both dialogs. A text that runs past
 * its box or the button it is on, is cut off by it, or leaves the screen is a
 * failure. The illustrated map itself pans and is left out.
 */

// Firefox has no mobile emulation; its phone pages keep their size and touch.
const firefox = process.env.BROWSER === 'firefox';

const VIEWPORTS = [
  { name: '320', width: 320, height: 640, phone: true },
  { name: '360', width: 360, height: 740, phone: true },
  { name: '390', width: 390, height: 844, phone: true },
  { name: '430', width: 430, height: 932, phone: true },
  { name: 'phone held sideways', width: 844, height: 390, phone: true },
  { name: '1280', width: 1280, height: 800, phone: false },
  { name: '1440', width: 1440, height: 900, phone: false },
] as const;

/** Visible text that runs past its box, is cut off by it or leaves the screen. */
async function overflowing(page: Page) {
  return page.evaluate(() => {
    const found: string[] = [];
    const seen = new Set<string>();
    const visible = (element: Element) => {
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        const style = getComputedStyle(node);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0
        )
          return false;
        // hidden for the eye only (read by screen readers, or a skip link until it is focused)
        if (
          node.classList.contains('sr-only') ||
          node.getAttribute('aria-hidden') === 'true' ||
          style.clipPath.startsWith('inset(50%')
        )
          return false;
      }
      return true;
    };
    const say = (element: Element, why: string, px: number) => {
      const text = (element.textContent ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 60);
      const key = `${why}|${text}`;
      if (seen.has(key)) return;
      seen.add(key);
      const tag = (node: Element | null) =>
        node
          ? node.tagName.toLowerCase() +
            [...node.classList]
              .slice(0, 2)
              .map((name) => '.' + name)
              .join('')
          : '';
      found.push(
        `“${text}” ${why} (${Math.round(px)} px, ${tag(element.parentElement)} > ${tag(element)})`,
      );
    };
    const screenRight = document.documentElement.clientWidth;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue;
      const element = node.parentElement;
      if (
        !element ||
        element.closest('script, style, noscript, svg, .map-stage') ||
        !visible(element)
      )
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter(
        (rect) => rect.width > 0.5 && rect.height > 0.5,
      );
      if (!rects.length) continue;
      const style = getComputedStyle(element);
      // cut off by its own box (an ellipsis, or a box that hides what does not fit)
      if (
        (style.overflowX !== 'visible' || style.textOverflow === 'ellipsis') &&
        element.scrollWidth > element.clientWidth + 1
      )
        say(element, 'cut off', element.scrollWidth - element.clientWidth);
      // past the nearest box that clips it; a box that scrolls is meant to
      for (
        let box = element.parentElement;
        box && box !== document.body;
        box = box.parentElement
      ) {
        const boxStyle = getComputedStyle(box);
        if (
          ['auto', 'scroll'].includes(boxStyle.overflowX) ||
          ['auto', 'scroll'].includes(boxStyle.overflowY)
        )
          break;
        const clipsX = ['hidden', 'clip'].includes(boxStyle.overflowX);
        const clipsY = ['hidden', 'clip'].includes(boxStyle.overflowY);
        if (!clipsX && !clipsY) continue;
        const edge = box.getBoundingClientRect();
        // wholly outside the box is hidden on purpose (a skip link until it is focused)
        const inside = rects.some(
          (rect) =>
            rect.right > edge.left &&
            rect.left < edge.right &&
            rect.bottom > edge.top &&
            rect.top < edge.bottom,
        );
        if (!inside) break;
        const past = Math.max(
          0,
          ...rects.map((rect) =>
            Math.max(
              clipsX ? rect.right - edge.right : 0,
              clipsX ? edge.left - rect.left : 0,
              clipsY ? rect.bottom - edge.bottom : 0,
              clipsY ? edge.top - rect.top : 0,
            ),
          ),
        );
        if (past > 1.5) say(element, 'past its box', past);
        break;
      }
      // wider than the control it sits in, even where nothing clips it
      const control = element.closest(
        'button, a, [role="button"], label, summary',
      );
      if (control) {
        const edge = control.getBoundingClientRect();
        const past = Math.max(
          0,
          ...rects.map((rect) =>
            Math.max(rect.right - edge.right, edge.left - rect.left),
          ),
        );
        if (past > 1.5) say(element, 'past its button', past);
      }
      // off the screen
      const off = Math.max(
        0,
        ...rects.map((rect) => Math.max(rect.right - screenRight, -rect.left)),
      );
      if (off > 1.5) say(element, 'off the screen', off);
    }
    const sideways =
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth;
    if (sideways > 1) found.push(`the page scrolls sideways by ${sideways} px`);
    return found;
  });
}

for (const [path, names] of [
  ['/', { about: 'About the map Zahrady Prahy', add: 'Add a place · soon' }],
  ['/cs/', { about: 'O mapě Zahrady Prahy', add: 'Přidat místo · brzy' }],
] as const) {
  test.describe(`every text fits (${path})`, () => {
    for (const viewport of VIEWPORTS) {
      test(`at ${viewport.name}`, async ({ browser }) => {
        // thirteen panels and two dialogs: WebKit without a graphics card needs more than 30 s
        test.setTimeout(120_000);
        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
          isMobile: viewport.phone && !firefox,
          hasTouch: viewport.phone,
          reducedMotion: 'reduce',
        });
        const found: string[] = [];
        const look = async (where: string) => {
          await page.evaluate(() => document.fonts.ready);
          for (const item of await overflowing(page))
            if (!found.some((line) => line.endsWith(item)))
              found.push(`${where}: ${item}`);
        };

        await openAtlas(page, path);
        await look('the atlas');

        const filters = page.locator('[aria-controls="garden-filters"]');
        if (await filters.isVisible()) {
          await filters.click();
          await expect(page.locator('#garden-filters')).toBeVisible();
          await look('the filters');
          await filters.click();
        }

        // the markers follow the catalogue; a click from the page reaches one
        // the map has panned out of view
        const markers = page.locator('.garden-marker');
        await expect(markers).toHaveCount(gardens.length);
        for (const [index, garden] of gardens.entries()) {
          await markers
            .nth(index)
            .evaluate((marker) => (marker as HTMLElement).click());
          await expect(markers.nth(index)).toHaveAttribute(
            'aria-pressed',
            'true',
          );
          await expect(page.locator('.garden-preview h2')).toContainText(
            garden.name,
          );
          await page.waitForTimeout(150);
          await look(garden.id);
        }
        await page.keyboard.press('Escape');

        for (const name of [names.about, names.add]) {
          await page.getByRole('button', { name, exact: true }).first().click();
          await expect(page.getByRole('dialog')).toBeVisible();
          await page.waitForTimeout(150);
          await look(name);
          await page.keyboard.press('Escape');
          await expect(page.getByRole('dialog')).toHaveCount(0);
        }

        expect(found).toEqual([]);
        await page.close();
      });
    }
  });
}
