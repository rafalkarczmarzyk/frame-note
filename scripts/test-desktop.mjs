import { assertDesktopTestEnvironment } from './desktop-test-environment.mjs';
import { _electron as electron, expect } from '@playwright/test';
import { desktopExecutable } from './desktop-runtime.mjs';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

assertDesktopTestEnvironment(process.platform, process.env);
const executable =
  process.env.FRAMENOTE_PACKAGED || (await desktopExecutable());
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
delete env.FRAMENOTE_DEV_SERVER_URL;
const profileRoot = await mkdtemp(resolve(tmpdir(), 'framenote-profile-'));
const profile = resolve(profileRoot, 'user-data');
const zipEntryNames = (bytes) => {
  const names = [];
  const endSignature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const endOffset = bytes.lastIndexOf(endSignature);
  if (endOffset < 0) throw new Error('ZIP end record is missing.');
  const entryCount = bytes.readUInt16LE(endOffset + 10);
  let offset = bytes.readUInt32LE(endOffset + 16);
  for (let index = 0; index < entryCount; index++) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50)
      throw new Error('ZIP central directory is invalid.');
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    names.push(bytes.toString('utf8', offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return names;
};
let app;
try {
  app = await electron.launch({
    executablePath: executable,
    args: [
      ...(process.env.FRAMENOTE_PACKAGED ? [] : [resolve('apps/desktop')]),
      `--user-data-dir=${profile}`,
    ],
    env,
  });
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForLoadState('networkidle');
  const bounds = async () =>
    app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getBounds(),
    );
  for (const width of [1440, 800]) {
    await app.evaluate(({ BrowserWindow }, width) => {
      BrowserWindow.getAllWindows()[0].setSize(width, 900);
    }, width);
    await expect.poll(() => page.evaluate(() => innerWidth)).toBe(width);
    const exportBounds = await page
      .getByRole('button', { name: 'Export JPG', exact: true })
      .boundingBox();
    expect(exportBounds).not.toBeNull();
    expect(exportBounds.x).toBeGreaterThanOrEqual(0);
    expect(exportBounds.x + exportBounds.width).toBeLessThanOrEqual(width);
    expect((await bounds()).width).toBe(width);
  }
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(1440, 900),
  );
  await expect.poll(() => page.evaluate(() => innerWidth)).toBe(1440);
  await app.evaluate(({ app, BrowserWindow }) => {
    app.focus({ steal: true });
    BrowserWindow.getAllWindows()[0].focus();
  });
  await app.evaluate(
    ({ BrowserWindow }) =>
      new Promise((resolve, reject) => {
        const window = BrowserWindow.getAllWindows()[0];
        const timer = setTimeout(
          () => reject(new Error('Timed out entering fullscreen')),
          15_000,
        );
        window.once('enter-full-screen', () => {
          clearTimeout(timer);
          resolve();
        });
        window.setFullScreen(true);
      }),
  );
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
    )
    .toBe(true);
  await app.evaluate(
    ({ BrowserWindow }) =>
      new Promise((resolve, reject) => {
        const window = BrowserWindow.getAllWindows()[0];
        const timer = setTimeout(
          () => reject(new Error('Timed out leaving fullscreen')),
          15_000,
        );
        window.once('leave-full-screen', () => {
          clearTimeout(timer);
          resolve();
        });
        window.setFullScreen(false);
      }),
  );
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
    )
    .toBe(false);
  const photoInput = page.getByLabel('Choose JPG or PNG photo');
  await expect(photoInput).toBeAttached();
  const output = resolve(profileRoot, 'wildlife.jpg');
  const zipOutput = resolve(profileRoot, 'photo-roll.zip');
  await app.evaluate(({ dialog }, file) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
  }, output);
  await page.context().setOffline(true);
  await photoInput.setInputFiles([
    {
      name: 'wildlife.jpg',
      mimeType: 'image/jpeg',
      buffer: await readFile('tests/fixtures/20260520-IMG_3843.jpg'),
    },
    {
      name: 'portrait.jpg',
      mimeType: 'image/jpeg',
      buffer: await readFile('tests/fixtures/20261021-IMG_0469.jpg'),
    },
    {
      name: 'bright-background.jpg',
      mimeType: 'image/jpeg',
      buffer: await readFile('tests/fixtures/20260405-K89A0565.jpg'),
    },
    {
      name: 'macro.jpg',
      mimeType: 'image/jpeg',
      buffer: await readFile('tests/fixtures/20261021-IMG_9959.jpg'),
    },
  ]);
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  const photos = roll.getByRole('button', { name: /^Photo \d+:/ });
  await expect(photos).toHaveCount(4);
  await expect(photos.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await photos.nth(2).click();
  await expect(photos.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(photos.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await photos.nth(0).click();
  await expect(photos.nth(0)).toHaveAttribute('aria-pressed', 'true');
  // Shared editor history, menu availability and one command per accelerator.
  const addLayer = page.getByRole('button', { name: 'Add layer', exact: true });
  const layerCount = async () =>
    page.locator('[data-section="containers"] [data-picker-row]').count();
  const initialLayerCount = await layerCount();
  await addLayer.click();
  await addLayer.click();
  await expect.poll(layerCount).toBe(initialLayerCount + 2);
  const menuState = (id) =>
    app.evaluate(
      ({ Menu }, id) => Menu.getApplicationMenu().getMenuItemById(id).enabled,
      id,
    );
  await expect.poll(() => menuState('edit-undo')).toBe(true);
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+z' : 'Control+z',
  );
  await expect.poll(layerCount).toBe(initialLayerCount + 1);
  await app.evaluate(({ Menu }) =>
    Menu.getApplicationMenu().getMenuItemById('edit-undo').click(),
  );
  await expect.poll(layerCount).toBe(initialLayerCount);
  await expect.poll(() => menuState('edit-undo')).toBe(false);
  await app.evaluate(({ Menu }) =>
    Menu.getApplicationMenu().getMenuItemById('edit-redo').click(),
  );
  await expect.poll(layerCount).toBe(initialLayerCount + 1);
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+Shift+z' : 'Control+Shift+z',
  );
  await expect.poll(layerCount).toBe(initialLayerCount + 2);
  await photos.nth(2).click();
  await expect.poll(layerCount).toBe(initialLayerCount);
  await expect.poll(() => menuState('edit-undo')).toBe(false);
  await photos.nth(0).click();
  await expect.poll(layerCount).toBe(initialLayerCount + 2);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(layerCount).toBe(initialLayerCount);
  const exportButton = page.getByRole('button', {
    name: 'Export JPG',
    exact: true,
  });
  await expect(exportButton).toBeEnabled({ timeout: 30_000 });
  await exportButton.click();
  await expect
    .poll(
      async () => (await readFile(output).catch(() => Buffer.alloc(0))).length,
      { timeout: 30_000 },
    )
    .toBeGreaterThan(1000);
  const bytes = await readFile(output);
  expect(bytes.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
  const dimensions = await page.evaluate(
    async (url) => {
      const image = new Image();
      image.src = url;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    },
    `data:image/jpeg;base64,${bytes.toString('base64')}`,
  );
  expect(dimensions).toEqual([5964, 3976]);
  await app.evaluate(({ dialog }, file) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
  }, zipOutput);
  await page
    .getByRole('button', { name: 'Export actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Export all', exact: true }).click();
  await expect
    .poll(
      async () =>
        (await readFile(zipOutput).catch(() => Buffer.alloc(0))).length,
      {
        timeout: 60_000,
      },
    )
    .toBeGreaterThan(1000);
  const names = zipEntryNames(await readFile(zipOutput));
  expect(names).toHaveLength(4);
  expect(names).toEqual([
    'wildlife-framenote.jpg',
    'portrait-framenote.jpg',
    'bright-background-framenote.jpg',
    'macro-framenote.jpg',
  ]);
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  try {
    await app?.close();
  } finally {
    await rm(profileRoot, { recursive: true, force: true });
  }
}
