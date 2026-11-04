import process from 'node:process';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, readFile, rm, cp, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';

if (process.platform !== 'win32')
  throw Error('Portable launcher smoke requires Windows.');
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const root = await mkdtemp(join(tmpdir(), 'FrameNote portable test '));
const directory = join(root, 'App folder with spaces');
await mkdir(directory);
const exe = join(directory, 'FrameNote portable.exe');
await cp(`release/ci/FrameNote-${version}-win-x64-portable.exe`, exe);
const server = createServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
await new Promise((resolve) => server.close(resolve));
const env = { ...process.env, FRAMENOTE_TEST_UPDATE_FEED: '1' };
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(
  exe,
  [
    `--user-data-dir=${join(root, 'profile')}`,
    `--remote-debugging-port=${port}`,
  ],
  { env, stdio: 'ignore' },
);
let browser;
let launchError;
child.on('error', (error) => {
  launchError = error;
});
try {
  await expect
    .poll(
      async () => {
        if (launchError) throw launchError;
        try {
          browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, {
            timeout: 2000,
          });
          return true;
        } catch {
          return false;
        }
      },
      { timeout: 90000, intervals: [1000] },
    )
    .toBe(true);
  const context = browser.contexts()[0];
  await context.setOffline(true);
  const page = context.pages()[0] || (await context.waitForEvent('page'));
  const input = page.getByLabel('Choose JPG or PNG photo');
  await expect(input).toBeAttached({ timeout: 30000 });
  await input.setInputFiles('tests/fixtures/20260520-IMG_3843.jpg');
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled({ timeout: 30000 });
} finally {
  await browser?.close();
  if (child.pid) {
    try {
      execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } catch {
      /* Already closed. */
    }
  }
  await rm(root, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 500,
  });
}
