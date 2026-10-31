import { verifyWindowChrome } from './desktop-window-chrome.mjs';
import ExifReader from 'exifreader';
import { _electron as electron, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const profileRoot = await mkdtemp(resolve(tmpdir(), 'framenote-profile-'));
// A first launch must create a previously nonexistent user-data directory.
const profile = resolve(profileRoot, 'user-data');
const launch = () =>
  electron.launch({
    executablePath: process.env.FRAMENOTE_PACKAGED || require('electron'),
    args: [
      ...(process.env.FRAMENOTE_PACKAGED ? [] : [resolve('apps/desktop')]),
      '--user-data-dir=' + profile,
    ],
    env,
  });
let app = await launch();
try {
  const page = await app.firstWindow();
  const errors = [];
  page.on('dialog', (dialog) => dialog.accept());
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Choose JPG or PNG photo')).toBeAttached();
  await verifyWindowChrome(app, page);
  if (!process.argv.includes('--chrome-only')) {
    await page.context().setOffline(true);
    const temp = await mkdtemp(resolve(tmpdir(), 'framenote-desktop-'));
    const output = resolve(temp, 'output.jpg');
    await app.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, output);
    await page
      .getByLabel('Choose JPG or PNG photo')
      .setInputFiles('tests/fixtures/20260520-IMG_3843.jpg');
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled({ timeout: 30000 });
    await button.click();
    await expect
      .poll(
        async () =>
          (await readFile(output).catch(() => Buffer.alloc(0))).length,
        { timeout: 30000 },
      )
      .toBeGreaterThan(1000);
    const bytes = await readFile(output);
    if (bytes[0] !== 255 || bytes[1] !== 216) throw new Error('Invalid JPG');
    const tags = ExifReader.load(bytes);
    if (
      tags['Image Width']?.value !== 5964 ||
      tags['Image Height']?.value !== 3976
    )
      throw new Error('Output dimensions changed');
    for (const key of [
      'Artist',
      'Orientation',
      'GPSLatitude',
      'GPSLongitude',
      'UserComment',
      'ProfileDescription',
    ]) {
      if (tags[key] !== undefined)
        throw new Error('Output retained unexpected metadata: ' + key);
    }
    const original = await readFile(output);
    await page.evaluate(async () => {
      try {
        await window.frameNoteDesktop.saveFile(
          '../forbidden.jpg',
          new Uint8Array([1]),
        );
        throw new Error('Unsafe filename accepted');
      } catch (error) {
        if (String(error).includes('Unsafe filename accepted')) throw error;
      }
    });
    await app.evaluate(({ dialog }) => {
      dialog.showSaveDialog = async () => ({ canceled: true });
    });
    await button.click();
    await expect(button).toBeEnabled();
    if (!(await readFile(output)).equals(original))
      throw new Error('Cancellation modified output');
    if (!(await page.evaluate(() => typeof window.require === 'undefined')))
      throw new Error('Node exposed');
    await app.evaluate(({ dialog }) => {
      dialog.showMessageBoxSync = () => 1;
    });
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    const zip = resolve(temp, 'roll.zip');
    await app.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, zip);
    await page
      .getByLabel('Choose JPG or PNG photo')
      .setInputFiles([
        'tests/fixtures/20261021-IMG_0469.jpg',
        'tests/fixtures/20260405-K89A0565.jpg',
        'tests/fixtures/20261021-IMG_9959.jpg',
        'tests/fixtures/20261020-2026-10-20 14-06-39 (A,R8,S4).jpg',
        'tests/fixtures/20210228-IMG_3200.jpg',
        'tests/fixtures/Agata-104.jpg',
      ]);
    await expect(button).toBeEnabled({ timeout: 30000 });
    await page
      .getByRole('button', { name: 'Export actions', exact: true })
      .click();
    await page
      .getByRole('menuitem', { name: 'Export all', exact: true })
      .click();
    await expect
      .poll(
        async () => (await readFile(zip).catch(() => Buffer.alloc(0))).length,
        { timeout: 60000 },
      )
      .toBeGreaterThan(1000);
    const zipBytes = await readFile(zip);
    if (zipBytes.readUInt16LE(zipBytes.length - 12) !== 7)
      throw new Error('ZIP must contain seven photos');
    console.log('Seven-photo ZIP bytes:', zipBytes.length);
    console.log(
      'Process memory (KiB):',
      await app.evaluate(({ app }) =>
        app
          .getAppMetrics()
          .map((item) => ({ type: item.type, memory: item.memory })),
      ),
    );
    if (zipBytes[0] !== 80 || zipBytes[1] !== 75)
      throw new Error('Invalid ZIP');
    await expect(button).toBeEnabled({ timeout: 30000 });
    await page
      .getByRole('button', { name: 'Save preset', exact: true })
      .click();
    await page
      .getByLabel('Preset name', { exact: true })
      .fill('Desktop persistence test');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      page.getByRole('combobox', { name: 'Saved preset' }),
    ).toContainText('Desktop persistence test');
    await page.locator('details[data-section="export"] > summary').click();
    await page.getByRole('radio', { name: 'Balanced', exact: true }).click();
    await expect(button).toBeEnabled({ timeout: 30_000 });
    await page
      .getByRole('button', { name: 'Close manage presets', exact: true })
      .click();
    await page.screenshot({ path: 'release/FrameNote-macOS-preview.png' });
    await app.close();
    app = await launch();
    const reopened = await app.firstWindow();
    await reopened.locator('details[data-section="export"] > summary').click();
    await expect(
      reopened.getByRole('radio', { name: 'Balanced', exact: true }),
    ).toBeChecked();
    await reopened.getByRole('combobox', { name: 'Saved preset' }).click();
    await expect(
      reopened.getByRole('option', {
        name: 'Desktop persistence test',
        exact: true,
      }),
    ).toBeVisible();
    await rm(temp, { recursive: true, force: true });
    console.log(
      'Desktop offline import, font loading, native JPG save, cancellation, ZIP, preset persistence and isolation passed.',
    );
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await app.close();
  await rm(profileRoot, { recursive: true, force: true });
}
