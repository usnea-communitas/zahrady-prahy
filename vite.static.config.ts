// Z-01 trial: the atlas as a plain Vite + React build, prerendered to static HTML.
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: 'next/image', replacement: here('./src/shims/next-image.tsx') },
      { find: /^@\//, replacement: here('./') },
    ],
  },
  build: { outDir: 'dist-static', emptyOutDir: true },
});
