import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json';

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  main: 'vinext/server/fetch-handler',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Vinext uses Nitro's native Vercel preset outside the Sites/Cloudflare
  // runtime. Keeping the branches separate preserves local previews and the
  // existing Sites deployment while producing Vercel Build Output on Vercel.
  const isVercelBuild =
    process.env.VERCEL === '1' || process.env.NITRO_PRESET === 'vercel';

  if (isVercelBuild) {
    const { nitro } = await import('nitro/vite');
    const { default: tailwindcssVite } = await import('@tailwindcss/vite');

    // Nitro writes these rules into .vercel/output/config.json, which is
    // what Vercel routes by. Hashed build assets under /_next/static are
    // already immutable; the media keep their names between releases, so
    // browsers may reuse them for a day and then revalidate in the
    // background instead of asking again on every visit.
    const media = {
      headers: {
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    };

    return {
      plugins: [
        vinext(),
        tailwindcssVite(),
        nitro({
          routeRules: {
            '/map/**': media,
            '/gardens/**': media,
            '/audio/**': media,
            '/zahrady-prahy-postcard.webp': media,
            '/zahrady-prahy-og.jpg': media,
          },
        }),
      ],
    };
  }

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
