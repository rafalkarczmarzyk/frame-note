import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import ExifReader from 'exifreader';

async function imageBytes(page: Page, width = 300, height = 200) {
  return page.evaluate(
    ({ width, height }) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d')!;
      context.fillStyle = 'rgb(80, 90, 100)';
      context.fillRect(0, 0, width, height);
      return canvas.toDataURL('image/png').split(',')[1]!;
    },
    { width, height },
  );
}
const input = (page: Page) => page.getByLabel('Choose JPG or PNG photo');
const caption = (page: Page) => page.getByLabel('Caption', { exact: true });
const exported = (page: Page) =>
  page.getByRole('button', { name: 'Export JPG', exact: true });
async function ready(page: Page) {
  await expect(
    page.getByRole('button', { name: 'Add photos', exact: true }),
  ).toBeEnabled();
}
function zipEntries(buffer: Buffer) {
  const entries = [];
  let offset = 0;
  while (buffer.readUInt32LE(offset) === 0x04034b50) {
    const size = buffer.readUInt32LE(offset + 18);
    const length = buffer.readUInt16LE(offset + 26);
    const start = offset + 30 + length;
    entries.push({
      name: buffer.subarray(offset + 30, start).toString('utf8'),
      data: buffer.subarray(start, start + size),
    });
    offset = start + size;
  }
  return entries;
}

test('adds photos, restores independent documents and exports the roll with collision-safe names', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const bytes = await imageBytes(page);
  await caption(page).fill('First signature');
  await input(page).setInputFiles({
    name: 'same.png',
    mimeType: 'image/png',
    buffer: Buffer.from(bytes, 'base64'),
  });
  await ready(page);
  await expect(
    page.getByRole('region', { name: 'Photo film roll' }),
  ).toHaveCount(0);
  await expect(caption(page)).toHaveAttribute(
    'data-template',
    'First signature',
  );
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('5');
  // A single-file canvas drop adds another photograph rather than replacing it.
  const portrait = await imageBytes(page, 200, 300);
  await page.evaluate((base64) => {
    const data = new DataTransfer();
    data.items.add(
      new File(
        [Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))],
        'same.png',
        { type: 'image/png' },
      ),
    );
    document.querySelector('[data-photo-canvas]')!.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: data,
      }),
    );
  }, portrait);
  await ready(page);
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  await expect(roll.getByRole('button')).toHaveCount(2);
  await expect(
    page.getByRole('combobox', { name: 'Saved preset', exact: true }),
  ).toContainText('Default');
  await expect(
    page.getByRole('spinbutton', { name: 'Font size', exact: true }),
  ).toHaveValue('2');
  await expect(caption(page)).not.toHaveAttribute(
    'data-template',
    'First signature',
  );
  await caption(page).fill('Second signature');
  await roll
    .getByRole('button', { name: 'Photo 1: same.png', exact: true })
    .click();
  await ready(page);
  await expect(caption(page)).toHaveAttribute(
    'data-template',
    'First signature',
  );
  await expect(
    page.getByRole('spinbutton', { name: 'Font size', exact: true }),
  ).toHaveValue('5');
  await expect(exported(page)).toBeEnabled();
  const singlePromise = page.waitForEvent('download');
  await exported(page).click();
  const single = await readFile((await (await singlePromise).path())!);
  await page
    .getByRole('button', { name: 'Export actions', exact: true })
    .click();
  const batchPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: 'Export all', exact: true }).click();
  const download = await batchPromise;
  expect(download.suggestedFilename()).toBe('framenote-roll.zip');
  const entries = zipEntries(await readFile((await download.path())!));
  expect(entries.map((entry) => entry.name)).toEqual([
    'same-framenote.jpg',
    'same-framenote-2.jpg',
  ]);
  expect(entries[0]!.data).toEqual(single);
  for (const [index, entry] of entries.entries()) {
    const tags = ExifReader.load(entry.data);
    expect(tags['Image Width']?.value).toBe(index === 0 ? 300 : 200);
    expect(tags['Image Height']?.value).toBe(index === 0 ? 200 : 300);
  }
  await roll
    .getByRole('button', { name: 'Photo 2: same.png', exact: true })
    .click();
  await ready(page);
  await expect(caption(page)).toHaveAttribute(
    'data-template',
    'Second signature',
  );
  await caption(page).press('ControlOrMeta+z');
  await expect(caption(page)).toHaveAttribute(
    'data-template',
    'Second signature',
  );
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  await page
    .getByRole('menuitem', { name: 'Close photo', exact: true })
    .click();
  await ready(page);
  await expect(roll).toHaveCount(0);
  await expect(caption(page)).toHaveAttribute(
    'data-template',
    'First signature',
  );
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('menuitem', { name: 'Dispose roll…', exact: true })
    .click();
  await expect(page.getByRole('img', { name: /Photo preview:/ })).toHaveCount(
    0,
  );
  await expect(caption(page)).toHaveAttribute(
    'data-template',
    'First signature',
  );
  await expect(exported(page)).toBeDisabled();
  expect(errors).toEqual([]);
});

test('imports a mixed batch, confirms warnings once and releases all photo URLs on disposal', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const urls = new Set<string>();
    Object.assign(window, { livePhotoUrls: urls });
    const create = URL.createObjectURL.bind(URL),
      revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      urls.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      urls.delete(url);
      revoke(url);
    };
  });
  await page.goto('/');
  const bytes = Buffer.from(await imageBytes(page), 'base64');
  await input(page).setInputFiles([
    { name: 'first.png', mimeType: 'image/png', buffer: bytes },
    { name: 'bad.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('invalid') },
    { name: 'second.png', mimeType: 'image/png', buffer: bytes },
  ]);
  await ready(page);
  await expect(page.getByRole('alert')).toContainText('bad.jpg');
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  await expect(roll.getByRole('button')).toHaveCount(2);
  // One decoded source URL and two thumbnails; inactive originals are released.
  const urls = () =>
    page.evaluate(
      () =>
        (window as unknown as { livePhotoUrls: Set<string> }).livePhotoUrls
          .size,
    );
  await expect.poll(urls).toBe(3);
  let confirmations = 0;
  page.on('dialog', async (dialog) => {
    confirmations++;
    expect(dialog.message()).toContain('2 photos');
    await dialog.dismiss();
  });
  await page
    .getByRole('button', { name: 'Export actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Export all', exact: true }).click();
  expect(confirmations).toBe(1);
  page.removeAllListeners('dialog');
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page
    .getByRole('menuitem', { name: 'Dispose roll…', exact: true })
    .click();
  await expect(roll).toBeVisible();
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('menuitem', { name: 'Dispose roll…', exact: true })
    .click();
  await expect(roll).toHaveCount(0);
  await expect.poll(urls).toBe(0);
});

test('cancels pending imports and batch export without adding stale photos or downloading partial output', async ({
  page,
}) => {
  await page.goto('/');
  const bytes = Buffer.from(await imageBytes(page), 'base64');
  await page.evaluate(() => {
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === 'slow.png') {
        document.body.dataset.readPending = 'yes';
        await new Promise<void>((resolve) =>
          window.addEventListener('release-read', () => resolve(), {
            once: true,
          }),
        );
      }
      return read.call(this);
    };
  });
  await input(page).setInputFiles({
    name: 'slow.png',
    mimeType: 'image/png',
    buffer: bytes,
  });
  await expect(page.locator('body')).toHaveAttribute(
    'data-read-pending',
    'yes',
  );
  await input(page).setInputFiles({
    name: 'queued.png',
    mimeType: 'image/png',
    buffer: bytes,
  });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('release-read')));
  await ready(page);
  await expect(page.getByRole('img', { name: /Photo preview:/ })).toHaveCount(
    0,
  );
  await input(page).setInputFiles({
    name: 'fast.png',
    mimeType: 'image/png',
    buffer: bytes,
  });
  await ready(page);
  await expect(
    page.getByRole('img', { name: 'Photo preview: fast.png' }),
  ).toBeVisible();
  await caption(page).fill('First');
  await input(page).setInputFiles({
    name: 'other.png',
    mimeType: 'image/png',
    buffer: bytes,
  });
  await ready(page);
  await caption(page).fill('Second');
  await page.evaluate(() => {
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === 'fast.png') {
        document.body.dataset.exportPending = 'yes';
        await new Promise<void>((resolve) =>
          window.addEventListener('release-export', () => resolve(), {
            once: true,
          }),
        );
      }
      return read.call(this);
    };
  });
  const downloads: string[] = [];
  page.on('download', (download) =>
    downloads.push(download.suggestedFilename()),
  );
  await page
    .getByRole('button', { name: 'Export actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Export all', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute(
    'data-export-pending',
    'yes',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('release-export')));
  await ready(page);
  await expect(
    page.getByRole('region', { name: 'Photo film roll' }).getByRole('button'),
  ).toHaveCount(2);
  await expect(caption(page)).toHaveAttribute('data-template', 'Second');
  expect(downloads).toEqual([]);
});

test('switches photos with a centered glass loader without moving the canvas or film roll', async ({
  page,
}) => {
  await page.goto('/');
  const bytes = Buffer.from(await imageBytes(page), 'base64');
  await input(page).setInputFiles([
    { name: 'first.png', mimeType: 'image/png', buffer: bytes },
    { name: 'second.png', mimeType: 'image/png', buffer: bytes },
  ]);
  await ready(page);
  const surface = page.locator('[data-photo-canvas]').first();
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  const beforeCanvas = await surface.boundingBox();
  const beforeRoll = await roll.boundingBox();
  await page.evaluate(() => {
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === 'second.png') {
        document.body.dataset.switchPending = 'yes';
        await new Promise<void>((resolve) =>
          window.addEventListener('release-switch', () => resolve(), {
            once: true,
          }),
        );
      }
      return read.call(this);
    };
  });
  await roll
    .getByRole('button', { name: 'Photo 2: second.png', exact: true })
    .click();
  await expect(page.locator('body')).toHaveAttribute(
    'data-switch-pending',
    'yes',
  );
  const loader = surface
    .getByRole('status')
    .filter({ hasText: 'Preparing preview…' });
  await expect(loader).toBeVisible();
  expect(await surface.boundingBox()).toEqual(beforeCanvas);
  expect(await roll.boundingBox()).toEqual(beforeRoll);
  const card = await loader.locator('.glass-popover').boundingBox();
  expect(card!.x + card!.width / 2).toBeCloseTo(
    beforeCanvas!.x + beforeCanvas!.width / 2,
    0,
  );
  expect(card!.y + card!.height / 2).toBeCloseTo(
    beforeCanvas!.y + beforeCanvas!.height / 2,
    0,
  );
  await page.evaluate(() => window.dispatchEvent(new Event('release-switch')));
  await ready(page);
  await expect(loader).toHaveCount(0);
  await expect(
    roll.getByRole('button', { name: 'Photo 2: second.png', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(await surface.boundingBox()).toEqual(beforeCanvas);
  expect(await roll.boundingBox()).toEqual(beforeRoll);
});
