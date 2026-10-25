import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import {
  brightBackgroundFixture,
  heliconFixture,
  macroFixture,
  nightFixture,
  portraitFixture,
  wildlifeFixture,
  xmpPortraitFixture,
} from '../tests/fixtures.ts';
import { comparePhotoExport } from './photo-export-image.js';

const photos = [
  { name: 'wildlife', file: wildlifeFixture },
  { name: 'portrait', file: portraitFixture },
  { name: 'bright-background', file: brightBackgroundFixture },
  { name: 'macro', file: macroFixture },
  { name: 'helicon', file: heliconFixture },
  { name: 'night-portrait', file: nightFixture },
  { name: 'xmp-portrait', file: xmpPortraitFixture },
] as const;
const presets = ['Default', 'Default dark', 'Macro'] as const;

async function exportPhoto(page: Page) {
  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(button).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await button.click();
  const path = await (await downloadPromise).path();
  if (!path) throw new Error('The Photo export did not produce a file.');
  return readFile(path);
}

for (const photo of photos) {
  for (const preset of presets) {
    test(`Photo export matrix / ${photo.name} / ${preset}`, async ({
      page,
    }, testInfo) => {
      page.on('dialog', (dialog) => dialog.accept());
      await page.goto('/');
      await page
        .getByLabel('Choose JPG or PNG photo')
        .setInputFiles(photo.file.path);
      await page.getByRole('combobox', { name: 'Saved preset' }).click();
      await page.getByRole('option', { name: preset, exact: true }).click();
      await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
        'data-template',
        preset === 'Macro' ? '{heliconStack}' : '{author}\n{lens}\n{exposure}',
      );
      await comparePhotoExport(
        page,
        testInfo,
        `${photo.name}-${preset.toLowerCase().replaceAll(' ', '-')}`,
        await exportPhoto(page),
        photo.file.dimensions,
      );
    });
  }
}

const anchors = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

test.describe('Photo export geometry / all anchors', () => {
  for (const anchor of anchors) {
    test(anchor, async ({ page }, testInfo) => {
      await page.goto('/');
      const photo = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const context = canvas.getContext('2d')!;
        context.fillStyle = '#151820';
        context.fillRect(0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 1).split(',')[1]!;
      });
      await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
        name: 'anchor-grid.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(photo, 'base64'),
      });

      const marker = {
        name: 'marker',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24"><rect width="48" height="24" fill="#00ff00"/></svg>',
        aspect: 2,
      };
      const preset = {
        version: 2,
        id: `anchor-${anchor}`,
        name: `Anchor ${anchor}`,
        icons: [],
        layout: {
          sizingUnit: 'px',
          margins: { top: 40, right: 60, bottom: 80, left: 100 },
          marginLinkMode: 'none',
          activeId: 'marker-layer',
          containers: [
            {
              id: 'marker-layer',
              visible: true,
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
              position: { anchor },
              logo: { asset: marker, width: 48, colorMode: 'original' },
            },
          ],
        },
      };
      await page.getByLabel('Import preset file').setInputFiles({
        name: 'anchor.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(preset)),
      });
      await expect(
        page.getByRole('combobox', { name: 'Saved preset' }),
      ).toContainText(`Anchor ${anchor}`);
      const jpeg = await exportPhoto(page);

      const measured = await page.evaluate(async (base64) => {
        const image = new Image();
        image.src = `data:image/jpeg;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        const data = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        let minX = canvas.width,
          minY = canvas.height,
          maxX = -1,
          maxY = -1;
        for (let y = 0; y < canvas.height; y++)
          for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 4;
            const red = data[offset]!,
              green = data[offset + 1]!,
              blue = data[offset + 2]!;
            if (green > 150 && red < 100 && blue < 120) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        return { minX, minY, maxX, maxY };
      }, jpeg.toString('base64'));

      const expectedX = anchor.endsWith('left')
        ? 100
        : anchor.endsWith('right')
          ? 1092
          : 596;
      const expectedY = anchor.startsWith('top')
        ? 40
        : anchor.startsWith('bottom')
          ? 696
          : 368;
      expect(measured.minX).toBe(expectedX);
      expect(measured.minY).toBe(expectedY);
      expect(measured.maxX).toBe(expectedX + 47);
      expect(measured.maxY).toBe(expectedY + 23);

      await comparePhotoExport(page, testInfo, `anchor-${anchor}`, jpeg, {
        width: 1200,
        height: 800,
      });
    });
  }

  test('manual position uses the anchor point and ignores margins', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const photo = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#151820';
      context.fillRect(0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 1).split(',')[1]!;
    });
    await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
      name: 'manual-position.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from(photo, 'base64'),
    });
    const preset = {
      version: 2,
      id: 'manual-position',
      name: 'Manual position',
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
      name: 'manual.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(preset)),
    });
    const jpeg = await exportPhoto(page);
    const measured = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let minX = canvas.width,
        minY = canvas.height,
        maxX = -1,
        maxY = -1;
      for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++) {
          const offset = (y * canvas.width + x) * 4;
          const red = data[offset]!,
            green = data[offset + 1]!,
            blue = data[offset + 2]!;
          if (green > 150 && red < 100 && blue < 120) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      return { minX, minY, maxX, maxY };
    }, jpeg.toString('base64'));
    expect(measured).toEqual({ minX: 276, minY: 588, maxX: 323, maxY: 611 });
    await comparePhotoExport(
      page,
      testInfo,
      'manual-anchor-center-25-75',
      jpeg,
      { width: 1200, height: 800 },
    );
  });
});

const fonts = [
  { name: 'montserrat-regular', label: 'Montserrat', bold: false },
  { name: 'montserrat-bold', label: 'Montserrat', bold: true },
  { name: 'advercase-regular', label: 'Advercase', bold: false },
] as const;

for (const font of fonts) {
  test(`Photo export typography / ${font.name}`, async ({ page }, testInfo) => {
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
      name: 'font-matrix.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from(source, 'base64'),
    });
    await page
      .getByLabel('Caption', { exact: true })
      .fill('FrameNote 0123\nŻółw © · ×');
    await page.getByRole('button', { name: 'Font', exact: true }).click();
    if (font.label === 'Advercase')
      await page.getByRole('button', { name: /Advercase/ }).click();
    else await page.getByRole('button', { name: /Montserrat/ }).click();
    if (font.bold)
      await page.getByRole('button', { name: 'Bold', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Sizing unit', exact: true })
      .click();
    await page
      .getByRole('option', { name: 'Pixels (px)', exact: true })
      .click();
    await page
      .getByRole('spinbutton', { name: 'Font size', exact: true })
      .fill('32');
    const weight = font.bold ? 700 : 400;
    const family =
      font.label === 'Advercase' ? 'Advercase' : 'Montserrat Variable';
    await expect
      .poll(() =>
        page.evaluate(
          (spec) => document.fonts.check(spec),
          `${weight} 32px "${family}"`,
        ),
      )
      .toBe(true);
    await comparePhotoExport(
      page,
      testInfo,
      `typography-${font.name}`,
      await exportPhoto(page),
      { width: 640, height: 480 },
    );
  });
}
