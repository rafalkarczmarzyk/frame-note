// SPDX-License-Identifier: GPL-3.0-or-later
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import process from 'node:process';
import { chromium, expect } from '@playwright/test';
import { assertDesktopTestEnvironment } from './desktop-test-environment.mjs';

assertDesktopTestEnvironment(process.platform, process.env);
const profile = await mkdtemp(join(tmpdir(), 'framenote-live-preview-'));
const uiFile = resolve(
  'packages/editor/src/features/photo/empty-workspace.tsx',
);
const preloadFile = resolve('apps/desktop/preload.cjs');
const originals = new Map(
  await Promise.all(
    [uiFile, preloadFile].map(async (file) => [
      file,
      await readFile(file, 'utf8'),
    ]),
  ),
);
const modified = new Map();
let child;
let browser;
let output = '';
let urls = [];
async function edit(file, text) {
  modified.set(file, text);
  await writeFile(file, text);
}
async function restore(file) {
  if (!modified.has(file)) return;
  if ((await readFile(file, 'utf8')) !== modified.get(file))
    throw Error(`Source changed concurrently; refusing to overwrite ${file}`);
  await writeFile(file, originals.get(file));
  modified.delete(file);
}
async function connect(index) {
  await expect
    .poll(() => urls.length, { timeout: 60000 })
    .toBeGreaterThan(index);
  browser = await chromium.connectOverCDP(urls[index]);
  const page = browser.contexts()[0].pages()[0];
  await expect(
    page.getByRole('heading', { name: 'Drop photos here' }),
  ).toBeVisible({ timeout: 60000 });
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:3001\//);
  expect(
    await page.evaluate(() => window.frameNoteDesktop.readPresets()),
  ).toEqual(expect.any(String));
  return page;
}
try {
  child = spawn(
    process.execPath,
    [
      'scripts/dev-desktop.mjs',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, FRAMENOTE_TEST_UPDATE_FEED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const collect = (chunk) => {
    output += chunk.toString();
    urls = [...output.matchAll(/DevTools listening on (ws:\/\/[^\s]+)/g)].map(
      (match) => match[1],
    );
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  let page = await connect(0);
  await page.evaluate(() => {
    window.__framenoteHmrSentinel = 'preserved';
  });
  await edit(
    uiFile,
    originals.get(uiFile).replace('Drop photos here', 'Live preview works'),
  );
  await expect(
    page.getByRole('heading', { name: 'Live preview works' }),
  ).toBeVisible({ timeout: 30000 });
  expect(await page.evaluate(() => window.__framenoteHmrSentinel)).toBe(
    'preserved',
  );
  expect(urls).toHaveLength(1);
  await restore(uiFile);
  await expect(
    page.getByRole('heading', { name: 'Drop photos here' }),
  ).toBeVisible({ timeout: 30000 });
  await edit(preloadFile, originals.get(preloadFile) + '\nfunction (\n');
  await expect
    .poll(() => output.includes('Desktop update failed'), { timeout: 15000 })
    .toBe(true);
  expect(urls).toHaveLength(1);
  await expect(
    page.getByRole('heading', { name: 'Drop photos here' }),
  ).toBeVisible();
  await restore(preloadFile);
  page = await connect(1);
  await edit(
    preloadFile,
    originals.get(preloadFile) + '\n// live-preview restart verification\n',
  );
  page = await connect(2);
  await restore(preloadFile);
  page = await connect(3);
  const exited = once(child, 'exit');
  await page.evaluate(() => window.close());
  await exited;
  expect(child.exitCode).toBe(0);
  await expect
    .poll(async () => {
      try {
        await fetch('http://127.0.0.1:3001');
        return false;
      } catch {
        return true;
      }
    })
    .toBe(true);
  // A second launch must reuse the released port and stop cleanly on Ctrl+C.
  output = '';
  urls = [];
  child = spawn(
    process.execPath,
    [
      'scripts/dev-desktop.mjs',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, FRAMENOTE_TEST_UPDATE_FEED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  await connect(0);
  const interrupted = once(child, 'exit');
  child.kill('SIGINT');
  await interrupted;
  expect(child.exitCode).toBe(0);
  await expect
    .poll(async () => {
      try {
        await fetch('http://127.0.0.1:3001');
        return false;
      } catch {
        return true;
      }
    })
    .toBe(true);
  console.log(
    'Desktop live preview passed: HMR without reload, native restart, IPC, close/Ctrl+C cleanup and second launch.',
  );
} catch (error) {
  console.error(output);
  throw error;
} finally {
  for (const file of [...modified.keys()]) await restore(file);
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    await exited;
  }
  await browser?.close().catch(() => {});
  await rm(profile, { recursive: true, force: true });
}
