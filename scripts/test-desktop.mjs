import { _electron as electron, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({
  executablePath: require('electron'),
  args: [resolve('apps/desktop')],
  env,
});
try {
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Choose JPG or PNG photo')).toBeAttached();
  await page.context().setOffline(true);
  const temp = await mkdtemp(resolve(tmpdir(), 'framenote-desktop-'));
  const output = resolve(temp, 'output.jpg');
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
  if (bytes[0] !== 255 || bytes[1] !== 216) throw new Error('Invalid JPG');
  await app.evaluate(({ dialog }) => {
    dialog.showSaveDialog = async () => ({ canceled: true });
  });
  await button.click();
  await expect(button).toBeEnabled();
  if (!(await page.evaluate(() => typeof window.require === 'undefined')))
    throw new Error('Node exposed');
  await app.evaluate(({ dialog }) => {
    dialog.showMessageBoxSync = () => 1;
  });
  await rm(temp, { recursive: true, force: true });
  console.log(
    'Desktop offline import, font loading, native JPG save, cancellation and isolation passed.',
  );
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await app.close();
}
