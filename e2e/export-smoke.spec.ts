import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('exports representative composition', async ({ page }) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JPG', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error('Export did not produce a file.');
  const jpeg = await readFile(path);
  expect(download.suggestedFilename()).toMatch(/\.jpg$/i);
  const png = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64}`;
    await image.decode();
    if (image.naturalWidth !== 5964 || image.naturalHeight !== 3976)
      throw new Error(
        `Unexpected export size ${image.naturalWidth}×${image.naturalHeight}`,
      );
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d')!.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1]!;
  }, jpeg.toString('base64'));
  expect(Buffer.from(png, 'base64')).toMatchSnapshot(
    'representative-composition.png',
  );
});
