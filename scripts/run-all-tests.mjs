import { spawnSync } from 'node:child_process';
import console from 'node:console';
import process from 'node:process';

const suites = [
  ['Unit, integration and tooling (Vitest)', ['test:unit']],
  ['E2E export smoke (Chromium)', ['test:e2e']],
  ['Visual UI (Chromium desktop)', ['test:visual']],
];
// Desktop tests require a graphical macOS session and a built renderer; run
// explicitly with pnpm desktop:compile && pnpm test:desktop.
const failed = [];

for (const [name, args] of suites) {
  console.log(`\nRunning: ${name}\n`);
  const result = spawnSync('pnpm', args, { stdio: 'inherit' });
  if (result.signal) {
    console.error(`Test run interrupted: ${result.signal}`);
    process.exit(1);
  }
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) failed.push(name);
}

if (failed.length) {
  console.error(`\nFailed suites: ${failed.join(', ')}`);
  process.exit(1);
}

console.log('\nAll test suites passed.');
