import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertFrameNoteClosed,
  checkInstallDirectory,
  inspectInstallTarget,
  installLocalApp,
} from './local-install-desktop.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
try {
  if (args.some((arg) => !['--user', '--open'].includes(arg)))
    throw new Error('Usage: pnpm desktop:install [--user] [--open]');
  if (process.platform !== 'darwin' || process.arch !== 'arm64')
    throw new Error(
      'Local installation requires macOS on Apple Silicon (arm64 Node.js).',
    );
  const directory = args.includes('--user')
    ? join(homedir(), 'Applications')
    : '/Applications';
  if (args.includes('--user')) await mkdir(directory, { recursive: true });
  await checkInstallDirectory(directory);
  await inspectInstallTarget(join(directory, 'FrameNote.app'));
  assertFrameNoteClosed();

  const run = (command, commandArgs) =>
    execFileSync(command, commandArgs, { cwd: root, stdio: 'inherit' });
  run('pnpm', ['desktop:clean']);
  run('pnpm', ['desktop:build']);
  const installed = await installLocalApp(
    join(root, 'release/FrameNote-darwin-arm64/FrameNote.app'),
    directory,
  );
  console.log(`Installed ${installed}`);
  if (args.includes('--open')) run('/usr/bin/open', [installed]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
