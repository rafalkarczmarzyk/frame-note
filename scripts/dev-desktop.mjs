// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { createServer } from 'vite';
import { build } from 'esbuild';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import process from 'node:process';
import { desktopExecutable } from './desktop-runtime.mjs';

const runFile = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const nativeFiles = ['main.cjs', 'preload.cjs'].map((name) =>
  resolve(root, 'apps/desktop', name),
);
let adapterSources = new Set();
let server;
let child;
let timer;
let stopping = false;
let restarting = false;
let queue = Promise.resolve();

async function buildAdapter() {
  await Promise.all(
    nativeFiles.map((file) => runFile(process.execPath, ['--check', file])),
  );
  const result = await build({
    absWorkingDir: root,
    entryPoints: ['apps/desktop/src/preset-files.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: 'apps/desktop/preset-files.cjs',
    metafile: true,
  });
  adapterSources = new Set(
    Object.keys(result.metafile.inputs)
      .filter((file) => !file.includes('node_modules/'))
      .map((file) => resolve(root, file)),
  );
  server?.watcher.add([...adapterSources]);
}
async function closeChild() {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null)
    return;
  const current = child;
  const exited = once(current, 'exit');
  current.kill('SIGTERM');
  const timeout = setTimeout(() => current.kill('SIGKILL'), 5000);
  try {
    await exited;
  } finally {
    clearTimeout(timeout);
  }
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  clearTimeout(timer);
  process.exitCode = code;
  await closeChild();
  await server?.close();
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => void stop());

async function start() {
  const executable = await desktopExecutable();
  if (stopping) return;
  await buildAdapter();
  if (stopping) return;
  server = await createServer({
    configFile: resolve(root, 'vite.config.ts'),
    mode: 'desktop',
    server: { host: '127.0.0.1', port: 3001, strictPort: true, open: false },
  });
  if (stopping) {
    await server.close();
    return;
  }
  await server.listen();
  if (stopping) {
    await server.close();
    return;
  }
  const url = server.resolvedUrls.local[0];
  const env = { ...process.env, FRAMENOTE_DEV_SERVER_URL: url };
  delete env.ELECTRON_RUN_AS_NODE;
  const launch = () => {
    if (stopping) return;
    child = spawn(
      executable,
      [resolve(root, 'apps/desktop'), ...process.argv.slice(2)],
      {
        cwd: root,
        env,
        stdio: 'inherit',
      },
    );
    child.on('error', (error) => {
      process.stderr.write(error.message + '\n');
      void stop(1);
    });
    child.on('exit', (code) => {
      if (!restarting && !stopping) void stop(code ?? 1);
    });
  };
  server.watcher.add([...nativeFiles, ...adapterSources]);
  server.watcher.on('change', (file) => {
    if (stopping || (!nativeFiles.includes(file) && !adapterSources.has(file)))
      return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      queue = queue.then(async () => {
        if (stopping) return;
        try {
          await buildAdapter();
          if (stopping) return;
          restarting = true;
          await closeChild();
          launch();
          console.log(
            'FrameNote desktop restarted after native source changes.',
          );
        } catch (error) {
          console.error(
            'Desktop update failed; fix the source to retry.',
            error,
          );
        } finally {
          restarting = false;
        }
      });
    }, 200);
  });
  console.log(`FrameNote desktop live preview: ${url}`);
  console.log(
    'UI changes refresh live; main/preload/preset adapter changes restart Electron.',
  );
  launch();
}
try {
  await start();
} catch (error) {
  console.error(error);
  await stop(1);
}
