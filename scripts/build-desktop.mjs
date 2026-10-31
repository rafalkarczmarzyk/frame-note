import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
execFileSync('pnpm', ['exec', 'vite', 'build', '--mode', 'desktop'], {
  stdio: 'inherit',
});

await build({
  entryPoints: ['apps/desktop/src/preset-files.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'apps/desktop/preset-files.cjs',
});
