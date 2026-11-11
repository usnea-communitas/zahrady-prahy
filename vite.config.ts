// The atlas is a plain Vite + React app. `npm run build` (scripts/build-static.mjs)
// builds it and prerenders every page into static HTML in dist/.
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // One stylesheet, linked from every page: the app script is loaded after
  // the first paint (src/main.tsx), and the page must be styled before that.
  build: { cssCodeSplit: false },
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL('./', import.meta.url)),
      },
    ],
  },
  server: isCodexSeatbeltSandbox
    ? { watch: { useFsEvents: false, usePolling: true } }
    : undefined,
});
