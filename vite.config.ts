// @ts-expect-error Build metadata helper is plain JavaScript.
import { buildInfo } from './scripts/build-info.mjs';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  root: fileURLToPath(
    new URL(
      mode === 'desktop' ? './apps/desktop' : './apps/web',
      import.meta.url,
    ),
  ),
  define: { __FRAMENOTE_BUILD__: JSON.stringify(buildInfo()) },
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: {
    outDir: mode === 'desktop' ? 'renderer' : 'dist',
    emptyOutDir: true,
  },
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./packages/editor/src', import.meta.url)),
    },
  },
}));
