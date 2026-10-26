import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  brightBackgroundFixture,
  heliconFixture,
  wildlifeFixture,
} from '../tests/fixtures.ts';
import { comparePhotoExport } from './photo-export-image.js';

const exportButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Export JPG', exact: true });

async function exportJpeg(page: import('@playwright/test').Page) {
  await expect(exportButton(page)).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await exportButton(page).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error('The Photo export did not produce a file.');
  return readFile(path);
}

async function choosePreset(
  page: import('@playwright/test').Page,
  name: string,
) {
  const selector = page.getByRole('combobox', {
    name: 'Saved preset',
    exact: true,
  });
  await selector.click();
  await page.getByRole('option', { name, exact: true }).click();
}

test('Photo export / wildlife / Default', async ({ page }, testInfo) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await choosePreset(page, 'Default');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{author}\n{lens}\n{exposure}',
  );
  await comparePhotoExport(
    page,
    testInfo,
    'wildlife-default',
    await exportJpeg(page),
    wildlifeFixture.dimensions,
  );
});

test('Photo export / bright background / Default dark', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(brightBackgroundFixture.path);
  await choosePreset(page, 'Default dark');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{author}\n{lens}\n{exposure}',
  );
  await comparePhotoExport(
    page,
    testInfo,
    'bright-default-dark',
    await exportJpeg(page),
    brightBackgroundFixture.dimensions,
  );
});

test('Photo export / Helicon stack / Macro', async ({ page }, testInfo) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(heliconFixture.path);
  await choosePreset(page, 'Focus Stack');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{heliconStack}',
  );
  const tags = page.getByRole('button', {
    name: 'Browse available tags',
    exact: true,
  });
  await tags.click();
  await expect(
    page.getByRole('dialog', { name: 'Available tags' }),
  ).toContainText('Focus stack · 15 images · Method A · R=8 · S=4');
  await page.getByRole('button', { name: 'Close available tags' }).click();
  await comparePhotoExport(
    page,
    testInfo,
    'helicon-macro',
    await exportJpeg(page),
    heliconFixture.dimensions,
  );
});

test('Photo export / typography / Advercase Bold', async ({
  page,
}, testInfo) => {
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
    name: 'typography.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  const caption = page.getByLabel('Caption', { exact: true });
  await caption.fill('FrameNote 0123\nŻółw © · ×');
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
  await expect
    .poll(() =>
      page.evaluate(() => document.fonts.check('700 32px "Advercase"')),
    )
    .toBe(true);
  await comparePhotoExport(
    page,
    testInfo,
    'typography-advercase-bold',
    await exportJpeg(page),
    { width: 640, height: 480 },
  );
});

test('Photo export / repeated output has identical decoded pixels', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await choosePreset(page, 'Default');
  const first = await exportJpeg(page);
  const second = await exportJpeg(page);
  expect(first.equals(second)).toBe(true);
});
