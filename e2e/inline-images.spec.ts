import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { comparePhotoExport } from './photo-export-image.js';

test('Photo export / mixed inline SVG and PNG', async ({ page }, testInfo) => {
  await page.goto('/');
  const jpeg = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  const photo = {
    name: 'images.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(jpeg, 'base64'),
  };
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles(photo);
  await expect(
    page.getByRole('button', { name: 'Add logo', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Caption', { exact: true }).press('ControlOrMeta+a');
  await page.getByLabel('Caption', { exact: true }).press('Backspace');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '',
  );
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/rt.png');
  const raster = page.getByRole('img', { name: 'rt.png', exact: true });
  await raster.click();
  const height = page.getByLabel('Image height', { exact: true });
  await height.fill('3');
  await page
    .getByRole('button', { name: 'Increase Image height', exact: true })
    .click();
  await expect(height).toHaveValue('3.25');
  await expect(height).toBeFocused();
  await expect(raster.locator('..')).toHaveCSS('outline-width', '2px');
  await page
    .getByRole('combobox', { name: 'Sizing unit', exact: true })
    .click();
  await page.getByRole('option', { name: 'Pixels (px)', exact: true }).click();
  await raster.click();
  await page.getByRole('radio', { name: 'Fixed height', exact: true }).click();
  await height.fill('99');
  await page
    .getByRole('button', { name: 'Increase Image height', exact: true })
    .click();
  await expect(height).toHaveValue('100');
  const ready = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(ready).toBeEnabled();
  const pending = page.waitForEvent('download');
  await ready.click();
  const jpegBytes = await readFile((await (await pending).path())!);
  const colors = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    return [
      Array.from(context.getImageData(74, 726, 1, 1).data),
      Array.from(context.getImageData(400, 726, 1, 1).data),
    ];
  }, jpegBytes.toString('base64'));
  expect(colors[0]![0]).toBeGreaterThan(150);
  expect(colors[0]![1]).toBeLessThan(80);
  expect(colors[1]!.slice(0, 3).every((value) => value < 15)).toBe(true);
  // Return to text, then insert the vector in the same content flow.
  await page.getByLabel('Caption', { exact: true }).press('ArrowRight');
  await page.getByLabel('Caption', { exact: true }).press('End');
  await page.getByLabel('Caption', { exact: true }).press('Enter');
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/frame-note-logo.svg');
  await expect(
    page.getByRole('img', { name: 'frame-note-logo.svg', exact: true }),
  ).toBeVisible();
  await expect(raster).toHaveCount(1);
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page.getByLabel('Preset name', { exact: true }).fill('Mixed images');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.reload();
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles(photo);
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page.getByRole('option', { name: 'Mixed images', exact: true }).click();
  await expect(raster).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'frame-note-logo.svg', exact: true }),
  ).toBeVisible();
  await expect(ready).toBeEnabled();
  await raster.click();
  const clipboard = await page.evaluate(() => {
    const data = new DataTransfer();
    document.querySelector('[aria-label="Caption"]')!.dispatchEvent(
      new ClipboardEvent('copy', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
    return {
      text: data.getData('text/plain'),
      rich: data.getData('application/x-framenote-content'),
    };
  });
  await page.getByRole('button', { name: 'Remove image', exact: true }).click();
  await expect(raster).toHaveCount(0);
  await page.getByLabel('Caption', { exact: true }).press('ControlOrMeta+z');
  await expect(raster).toBeVisible();
  await raster.click();
  await expect(height).toHaveValue('100');
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await expect(raster).toHaveCount(0);
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '',
  );
  await page.evaluate((clipboard) => {
    const data = new DataTransfer();
    data.setData('text/plain', clipboard.text);
    data.setData('application/x-framenote-content', clipboard.rich);
    document.querySelector('[aria-label="Caption"]')!.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, clipboard);
  await expect(raster).toBeVisible();
  await raster.click();
  await expect(height).toHaveValue('100');
  const finalDownload = page.waitForEvent('download');
  await ready.click();
  const finalPath = await (await finalDownload).path();
  if (!finalPath) throw new Error('The mixed image export is missing.');
  await comparePhotoExport(
    page,
    testInfo,
    'mixed-inline-svg-png',
    await readFile(finalPath),
    { width: 1200, height: 800 },
  );
});
