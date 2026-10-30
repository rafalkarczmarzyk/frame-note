import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./apps/web', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: { outDir: 'dist', emptyOutDir: true },
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./packages/editor/src', import.meta.url)),
    },
  },
});
