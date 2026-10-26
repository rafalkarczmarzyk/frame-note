import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('chooses presets, validates custom HEX and exports the chosen color', async ({
  page,
}) => {
  await page.goto('/');
  const fixture = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'color-test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(fixture, 'base64'),
  });
  await page.getByLabel('Caption', { exact: true }).fill('MMMMMM');
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('8');
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Choose a color' });
  await panel.getByRole('button', { name: 'Sage', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Custom color', exact: true }),
  ).toHaveAttribute('title', 'Sage');
  const custom = panel.getByRole('textbox', { name: 'Custom color (HEX)' });
  await custom.fill('invalid');
  await custom.blur();
  await expect(panel.getByRole('alert')).toContainText('valid HEX');
  await expect(
    page.getByRole('button', { name: 'Custom color', exact: true }),
  ).toHaveAttribute('title', 'Sage');
  await custom.fill('abc');
  await expect(
    page.getByRole('button', { name: 'Custom color', exact: true }),
  ).toHaveAttribute('title', '#AABBCC');
  await custom.fill('abcd');
  await expect(custom).toHaveValue('abcd');
  await expect(
    page.getByRole('button', { name: 'Custom color', exact: true }),
  ).toHaveAttribute('title', '#AABBCC');
  await custom.fill('aabbcc');
  await custom.blur();
  await expect(custom).toHaveValue('#AABBCC');
  await expect(
    panel.getByRole('textbox', { name: 'Search colors' }),
  ).toHaveCount(1);
  await expect(panel.getByRole('button', { name: 'Apply color' })).toHaveCount(
    0,
  );
  await custom.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Color', exact: true }),
  ).toBeFocused();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JPG', exact: true }).click();
  const path = await (await downloadPromise).path();
  if (!path) throw new Error('Missing export');
  const bytes = await readFile(path);
  const matchingPixels = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = 'data:image/jpeg;base64,' + data;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let matches = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (
        Math.abs(pixels[i]! - 170) < 6 &&
        Math.abs(pixels[i + 1]! - 187) < 6 &&
        Math.abs(pixels[i + 2]! - 204) < 6
      )
        matches++;
    }
    return matches;
  }, bytes.toString('base64'));
  expect(matchingPixels).toBeGreaterThan(500);
});
