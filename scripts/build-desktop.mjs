import { build as buildAdapter } from 'esbuild';
import { build as buildRenderer } from 'vite';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

await buildRenderer({
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  mode: 'desktop',
});

await buildAdapter({
  absWorkingDir: repositoryRoot,
  entryPoints: ['apps/desktop/src/preset-files.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'apps/desktop/preset-files.cjs',
});
