import { execFileSync } from 'node:child_process';
execFileSync('pnpm', ['exec', 'vite', 'build', '--mode', 'desktop'], {
  stdio: 'inherit',
});
