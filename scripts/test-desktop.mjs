import { verifyWindowChrome } from './desktop-window-chrome.mjs';
import { verifyTooltipMaterial } from './desktop-tooltip-material.mjs';
import { assertDesktopTestEnvironment } from './desktop-test-environment.mjs';
import ExifReader from 'exifreader';
import { _electron as electron, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFile, readdir, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
assertDesktopTestEnvironment(process.platform, process.env);
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
let app;
try {
  app = await launch();
  const page = await app.firstWindow();
  const errors = [];
  page.on('dialog', (dialog) => dialog.accept());
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Choose JPG or PNG photo')).toBeAttached();
  const nativeFonts = await page.evaluate(() =>
    window.frameNoteDesktop.readSystemFonts(),
  );
  expect(nativeFonts.length).toBeGreaterThan(0);
  await expect(
    page.getByText('System fonts could not be read.', { exact: false }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  const fontPanel = page.getByRole('dialog', { name: 'Choose a font' });
  await fontPanel.getByRole('radio', { name: 'System', exact: true }).click();
  await fontPanel
    .getByRole('textbox', { name: 'Search fonts' })
    .fill('Helvetica');
  await expect(
    fontPanel.locator('[data-font-preview="Helvetica"]'),
  ).toHaveAttribute('data-font-preview-status', 'ready');
  await fontPanel
    .getByRole('button', { name: /^Helvetica\b/ })
    .first()
    .click();
  await expect(
    page.getByRole('button', { name: 'Font', exact: true }),
  ).toContainText('Helvetica');
  await expect(
    page
      .getByRole('button', { name: 'Font', exact: true })
      .getByText('Unavailable'),
  ).toHaveCount(0);
  await page.keyboard.press('Escape');
  await verifyTooltipMaterial(page);
  await verifyWindowChrome(app, page, {
    nativeTransitions: !process.argv.includes('--skip-native-transitions'),
  });
  if (!process.argv.includes('--chrome-only')) {
    await page.context().setOffline(true);
    const temp = resolve(profileRoot, 'exports');
    await mkdir(temp);
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
      dialog.showMessageBoxSync = () => {
        throw new Error('Unexpected native confirmation dialog');
      };
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
    const presetDirectory = resolve(profile, 'FrameNote/presets');
    const presetNames = (await readdir(presetDirectory)).filter((name) =>
      name.endsWith('.json'),
    );
    if (presetNames.length !== 1)
      throw Error('Expected one preset JSON on disk');
    expect(presetNames[0]).toBe('desktop-persistence-test.json');
    const storedPreset = JSON.parse(
      await readFile(resolve(presetDirectory, presetNames[0]), 'utf8'),
    );
    if (
      storedPreset.version !== 1 ||
      storedPreset.name !== 'Desktop persistence test'
    )
      throw Error('Disk preset must use shared format v1');
    const bridgePreset = JSON.parse(
      await page.evaluate(() => window.frameNoteDesktop.readPresets()),
    );
    if (JSON.stringify(bridgePreset) !== JSON.stringify([storedPreset]))
      throw Error('Renderer and file preset JSON differ');
    await page.locator('details[data-section="export"] > summary').click();
    await page.getByRole('radio', { name: 'Balanced', exact: true }).click();
    await expect(button).toBeEnabled({ timeout: 30_000 });
    await page
      .getByRole('button', { name: 'Close manage presets', exact: true })
      .click();
    await page.screenshot({ path: 'release/FrameNote-macOS-preview.png' });
    const windowClosed = page.waitForEvent('close', { timeout: 10000 });
    await app.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].close();
    });
    await windowClosed;
    await app.close();
    app = undefined;
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
  try {
    await app?.close();
  } finally {
    await rm(profileRoot, { recursive: true, force: true });
  }
}
