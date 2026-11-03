// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { desktopExecutable } from './desktop-runtime.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
delete env.FRAMENOTE_DEV_SERVER_URL;
const child = spawn(
  await desktopExecutable(),
  [
    fileURLToPath(new URL('../apps/desktop', import.meta.url)),
    ...process.argv.slice(2),
  ],
  { cwd: root, stdio: 'inherit', env },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
child.on('error', (error) => {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
