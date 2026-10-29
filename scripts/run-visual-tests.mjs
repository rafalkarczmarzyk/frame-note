import process from 'node:process';

import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
const mode = args.shift();
if (
  mode === 'update' &&
  (!args.includes('--grep') || !args.includes('--project'))
)
  throw new Error('Update requires --grep and --project.');
if (
  mode !== 'update' &&
  args.some(
    (a) => a.includes('update-snapshots') || a === '-u' || a.startsWith('-u='),
  )
)
  throw new Error('Use test:visual:update.');
if (args.includes('--ignore-snapshots'))
  throw new Error('Visual comparisons cannot ignore snapshots.');
if (!['run', 'review', 'report', 'update'].includes(mode))
  throw new Error('Unknown visual test mode.');
if (
  mode === 'update' &&
  (!args[args.indexOf('--grep') + 1]?.trim() ||
    !args[args.indexOf('--project') + 1]?.trim())
)
  throw new Error('Update requires non-empty --grep and --project values.');
const all = args.includes('--all-projects');
if (all) args.splice(args.indexOf('--all-projects'), 1);
if (mode !== 'report' && !all && !args.includes('--project'))
  args.push('--project', 'chromium-desktop');
const command =
  mode === 'report'
    ? ['exec', 'playwright', 'show-report', 'playwright-visual-report']
    : [
        'exec',
        'playwright',
        'test',
        '--config=playwright.visual.config.ts',
        ...(mode === 'review' ? ['--ui'] : []),
        ...(mode === 'update' ? ['--update-snapshots=changed'] : []),
        ...args,
      ];
if (mode === 'update') {
  const listing = spawnSync(
    'pnpm',
    [
      'exec',
      'playwright',
      'test',
      '--config=playwright.visual.config.ts',
      '--list',
      ...args,
    ],
    { stdio: 'inherit' },
  );
  if (listing.status !== 0) process.exit(listing.status ?? 1);
}
const result = spawnSync('pnpm', command, { stdio: 'inherit' });
process.exit(result.status ?? 1);
