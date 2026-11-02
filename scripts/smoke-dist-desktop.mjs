import process from 'node:process';
import { _electron as electron, expect } from '@playwright/test';
import { assertDesktopTestEnvironment } from './desktop-test-environment.mjs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
if (process.platform === 'darwin')
  assertDesktopTestEnvironment(process.platform, process.env);
const executables = {
  darwin: 'release/ci/mac-arm64/FrameNote.app/Contents/MacOS/FrameNote',
  win32: 'release/ci/win-unpacked/FrameNote.exe',
  linux: 'release/ci/linux-unpacked/framenote',
};
const profile = await mkdtemp(join(tmpdir(), 'framenote-dist-smoke-'));
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
let app;
try {
  app = await electron.launch({
    executablePath: resolve(executables[process.platform]),
    args: [
      '--user-data-dir=' + join(profile, 'profile'),
      // Only the isolated Linux CI smoke process; installed apps keep sandboxing.
      ...(process.platform === 'linux' && process.env.CI
        ? ['--no-sandbox']
        : []),
    ],
    env,
  });
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Choose JPG or PNG photo')).toBeAttached();
  await page.context().setOffline(true);
  const output = join(profile, 'output.jpg');
  await app.evaluate(({ dialog }, file) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
  }, output);
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles('tests/fixtures/20260520-IMG_3843.jpg');
  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(button).toBeEnabled({ timeout: 30000 });
  await button.click();
  await expect
    .poll(
      async () => (await readFile(output).catch(() => Buffer.alloc(0))).length,
      { timeout: 30000 },
    )
    .toBeGreaterThan(1000);
  const bytes = await readFile(output);
  expect([...bytes.subarray(0, 2)]).toEqual([255, 216]);
  expect(errors).toEqual([]);
} finally {
  await app?.close();
  await rm(profile, { recursive: true, force: true });
}
