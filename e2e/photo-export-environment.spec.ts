import { readFile } from 'node:fs/promises';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';
import { comparePhotoExport } from './photo-export-image.js';

async function download(page: Page) {
  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(button).toBeEnabled();
  const pending = page.waitForEvent('download');
  await button.click();
  const path = await (await pending).path();
  if (!path) throw new Error('The Photo export did not produce a file.');
  return readFile(path);
}

async function openWildlife(
  browser: Browser,
  width: number,
  height: number,
  dpr: number,
) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  return { context, page };
}

test('Photo export / unchanged across viewport size and display scale', async ({
  browser,
}) => {
  const first = await openWildlife(browser, 900, 700, 1);
  const firstJpeg = await download(first.page);
  await first.context.close();

  const second = await openWildlife(browser, 1500, 1000, 2);
  const secondJpeg = await download(second.page);
  await second.context.close();

  expect(secondJpeg.equals(firstJpeg)).toBe(true);
});

test('Photo export / waits for Advercase Bold before enabling download', async ({
  page,
}, testInfo) => {
  let sawFontRequest!: () => void;
  let releaseFont!: () => void;
  const requested = new Promise<void>((resolve) => (sawFontRequest = resolve));
  const fontGate = new Promise<void>((resolve) => (releaseFont = resolve));
  await page.route('**/Advercase-Bold.woff2', async (route) => {
    sawFontRequest();
    await fontGate;
    await route.continue();
  });

  await page.goto('/');
  const source = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#263442';
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 1).split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'delayed-font.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  await page
    .getByLabel('Caption', { exact: true })
    .fill('FrameNote 0123\nŻółw © · ×');
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await page.getByRole('button', { name: /Advercase/ }).click();
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Sizing unit', exact: true })
    .click();
  await page.getByRole('option', { name: 'Pixels (px)', exact: true }).click();
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('32');
  await requested;

  const exportButton = page.getByRole('button', {
    name: 'Export JPG',
    exact: true,
  });
  await expect(exportButton).toBeDisabled();
  releaseFont();
  await expect(exportButton).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(() => document.fonts.check('700 32px "Advercase"')),
    )
    .toBe(true);

  await comparePhotoExport(
    page,
    testInfo,
    'delayed-advercase-bold',
    await download(page),
    { width: 640, height: 480 },
  );
});

test('Photo export / preview geometry matches the saved marker position', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const source = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#151820';
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 1).split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'preview-geometry.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  const preset = {
    version: 2,
    id: 'preview-marker',
    name: 'Preview marker',
    icons: [],
    layout: {
      sizingUnit: 'px',
      margins: { top: 40, right: 60, bottom: 80, left: 100 },
      marginLinkMode: 'none',
      activeId: 'marker-layer',
      containers: [
        {
          id: 'marker-layer',
          template: '',
          style: {
            fontFamily: 'Montserrat Variable',
            fontWeight: 400,
            fontSize: 1,
            color: 'porcelain',
            opacity: 1,
            lineHeight: 1.4,
            textAlign: 'left',
          },
          position: { anchor: 'center', custom: { x: 25, y: 75 } },
          logo: {
            asset: {
              name: 'marker',
              svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24"><rect width="48" height="24" fill="#00ff00"/></svg>',
              aspect: 2,
            },
            width: 48,
            colorMode: 'original',
          },
        },
      ],
    },
  };
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'preview-marker.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();

  const samplePreviewPixel = () =>
    page.evaluate(() => {
      const preview = document.querySelector<HTMLElement>(
        '[aria-label="Photo preview: preview-geometry.jpg"]',
      );
      if (!preview) throw new Error('The photo preview is missing.');
      const bounds = preview.getBoundingClientRect();
      const scale = Math.min(
        Math.max(1, bounds.width - 80) / 1200,
        Math.max(1, bounds.height - 80) / 800,
        1,
      );
      const photoLeft = bounds.left + (bounds.width - 1200 * scale) / 2;
      const photoTop = bounds.top + (bounds.height - 800 * scale) / 2;
      const x = photoLeft + 300 * scale;
      const y = photoTop + 600 * scale;
      const canvases = Array.from(preview.querySelectorAll('canvas'));
      const diagnostics = canvases.map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        const context = canvas.getContext('2d');
        if (!context || !rect.width || !rect.height)
          return {
            width: canvas.width,
            height: canvas.height,
            rect: rect.toJSON(),
            green: null,
          };
        const pixelX = Math.floor(
          ((x - rect.left) / rect.width) * canvas.width,
        );
        const pixelY = Math.floor(
          ((y - rect.top) / rect.height) * canvas.height,
        );
        if (
          pixelX < 0 ||
          pixelY < 0 ||
          pixelX >= canvas.width ||
          pixelY >= canvas.height
        )
          return {
            width: canvas.width,
            height: canvas.height,
            rect: rect.toJSON(),
            green: 'out-of-bounds',
          };
        const rgba = Array.from(
          context.getImageData(pixelX, pixelY, 1, 1).data,
        );
        let greenPixels = 0;
        const data = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        for (let index = 0; index < data.length; index += 4)
          if (
            data[index]! < 40 &&
            data[index + 1]! > 180 &&
            data[index + 2]! < 40
          )
            greenPixels++;
        return {
          width: canvas.width,
          height: canvas.height,
          rect: rect.toJSON(),
          pixel: rgba.slice(0, 3),
          greenPixels,
        };
      });
      const pixel =
        diagnostics.find(
          (item) =>
            item.pixel &&
            item.pixel[1]! > 180 &&
            item.pixel[0]! < 40 &&
            item.pixel[2]! < 40,
        )?.pixel ?? null;
      return {
        pixel,
        diagnostics,
        previewRect: bounds.toJSON(),
        expected: { x, y, scale },
      };
    });
  let previewPixel = await samplePreviewPixel();
  for (let attempt = 0; !previewPixel.pixel && attempt < 10; attempt++) {
    await page.waitForTimeout(100);
    previewPixel = await samplePreviewPixel();
  }
  if (!previewPixel.pixel) {
    await testInfo.attach('preview-at-failure.png', {
      body: await page
        .getByLabel('Photo preview: preview-geometry.jpg')
        .screenshot(),
      contentType: 'image/png',
    });
  }
  expect(previewPixel.pixel, JSON.stringify(previewPixel)).not.toBeNull();
  if (!previewPixel.pixel)
    throw new Error('The preview marker is not visible.');

  const jpeg = await download(page);
  const savedPixel = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    return Array.from(context.getImageData(300, 600, 1, 1).data).slice(0, 3);
  }, jpeg.toString('base64'));
  for (const channel of [0, 1, 2])
    expect(
      Math.abs(previewPixel.pixel[channel]! - savedPixel[channel]!),
    ).toBeLessThan(20);
});
