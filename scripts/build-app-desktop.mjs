// SPDX-License-Identifier: GPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

// Local build produces an app, while CI compiles once before platform-specific dist.
if (process.platform !== 'darwin' || process.arch !== 'arm64')
  throw new Error(
    'desktop:build creates FrameNote.app on macOS Apple Silicon. On Windows/Linux, use pnpm desktop:compile followed by pnpm desktop:dist.',
  );
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync('pnpm', ['desktop:compile'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/package-desktop.mjs', '--no-dmg'], {
  cwd: root,
  stdio: 'inherit',
});
console.log('\nReady to open: release/FrameNote-darwin-arm64/FrameNote.app');
