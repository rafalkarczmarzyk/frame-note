import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { comparePhotoExport } from './photo-export-image.js';

test('Photo export / tomato raster preserves its preset size and position', async ({
  page,
}, testInfo) => {
  const rasterBytes = await readFile(
    fileURLToPath(new URL('../tests/fixtures/logos/rt.png', import.meta.url)),
  );
  const assetWidth = 14524;
  const assetHeight = 1884;
  const imageHeight = 120;
  const imageWidth = (imageHeight * assetWidth) / assetHeight;
  const expectedOrigin = {
    x: 1200 - 50 - imageWidth,
    y: 800 - 60 - imageHeight,
  };
  await page.goto('/');
  const photo = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#364152';
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'tomato-raster-background.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(photo, 'base64'),
  });
  const asset = {
    id: 'tomato-signature',
    name: 'rt.png',
    format: 'png',
    source: `data:image/png;base64,${rasterBytes.toString('base64')}`,
    width: assetWidth,
    height: assetHeight,
  };
  const preset = {
    version: 2,
    id: 'tomato-raster-geometry',
    name: 'Tomato raster geometry',
    icons: [],
    layout: {
      sizingUnit: 'px',
      margins: { top: 30, right: 50, bottom: 60, left: 40 },
      marginLinkMode: 'none',
      activeId: 'tomato-signature-layer',
      containers: [
        {
          id: 'tomato-signature-layer',
          template: '{image:tomato-signature:120:document:original}',
          images: [asset],
          style: {
            fontFamily: 'Montserrat Variable',
            fontWeight: 400,
            fontSize: 24,
            color: 'porcelain',
            opacity: 1,
            lineHeight: 1.4,
            textAlign: 'left',
          },
          position: { anchor: 'bottom-right' },
        },
      ],
    },
  };
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'tomato-raster-geometry.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  await expect(
    page.getByRole('combobox', { name: 'Saved preset' }),
  ).toContainText('Tomato raster geometry');

  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(button).toBeEnabled();
  const download = page.waitForEvent('download');
  await button.click();
  const downloadPath = await (await download).path();
  if (!downloadPath) throw new Error('The tomato raster export is missing.');
  const jpegBytes = await readFile(downloadPath);

  const bounds = await page.evaluate(
    async ({ source, actual }) => {
      const redBounds = async (src: string) => {
        const image = new Image();
        image.src = src;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        const { data } = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 4;
            const red = data[offset]!;
            const green = data[offset + 1]!;
            const blue = data[offset + 2]!;
            if (red > 150 && red > green * 1.6 && red > blue * 1.6) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }
        return { minX, minY, maxX, maxY };
      };
      return {
        source: await redBounds(source),
        actual: await redBounds(actual),
      };
    },
    {
      source: asset.source,
      actual: `data:image/jpeg;base64,${jpegBytes.toString('base64')}`,
    },
  );
  const scale = imageHeight / assetHeight;
  const expectedRedBounds = {
    minX: expectedOrigin.x + bounds.source.minX * scale,
    minY: expectedOrigin.y + bounds.source.minY * scale,
    maxX: expectedOrigin.x + (bounds.source.maxX + 1) * scale - 1,
    maxY: expectedOrigin.y + (bounds.source.maxY + 1) * scale - 1,
  };
  for (const edge of ['minX', 'minY', 'maxX', 'maxY'] as const) {
    expect(
      Math.abs(bounds.actual[edge] - expectedRedBounds[edge]),
      `${edge} of the red artwork in the saved JPG`,
    ).toBeLessThanOrEqual(2);
  }

  await comparePhotoExport(
    page,
    testInfo,
    'tomato-raster-bottom-right',
    jpegBytes,
    {
      width: 1200,
      height: 800,
    },
  );
});

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
  await page.locator('details[data-section="sizing"] > summary').click();
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
