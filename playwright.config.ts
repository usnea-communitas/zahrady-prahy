import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the static build, served like Vercel serves it
 * (scripts/serve-static.mjs applies the headers from vercel.json):
 *   npm run build && npm run test:e2e
 */
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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/serve-static.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
