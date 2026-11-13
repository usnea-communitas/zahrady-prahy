import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the static build, served like Vercel serves it
 * (scripts/serve-static.mjs applies the headers from vercel.json):
 *   npm run build && npm run test:e2e
 */
const DESKTOP = {
  chromium: 'Desktop Chrome',
  webkit: 'Desktop Safari',
  firefox: 'Desktop Firefox',
} as const;
const engine = (process.env.BROWSER ?? 'chromium') as keyof typeof DESKTOP;
if (!(engine in DESKTOP))
  throw new Error(`BROWSER=${engine}: use chromium, webkit or firefox`);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  // Chromium by default; BROWSER=webkit (the engine of Safari) or BROWSER=firefox
  // runs the same tests there (S-17, the Browsers workflow).
  // WebKit on machines without a graphics card (CI, containers) draws the
  // map's slow drifting animations in software and gets almost no frames
  // left; with reduced motion, which the atlas honours, it runs the tests at
  // full speed. Real Safari draws them on the graphics card.
  projects: [
    {
      name: engine,
      use: {
        ...devices[DESKTOP[engine]],
        ...(engine === 'webkit' ? { reducedMotion: 'reduce' as const } : {}),
      },
    },
  ],
  webServer: {
    command: 'node scripts/serve-static.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
