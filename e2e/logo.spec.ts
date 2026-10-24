import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('adds and replaces a proportional SVG logo, exports original and single colors, and shares positioning', async ({
  page,
}) => {
  await page.goto('/');
  const black = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'black';
    context.fillRect(0, 0, 1200, 800);
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  const photo = {
    name: 'logo-test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(black, 'base64'),
  };
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await page.getByLabel('Caption', { exact: true }).fill('Author');
  await page.getByLabel('Upload SVG logo').setInputFiles({
    name: 'two-colors.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="50" height="50" fill="red"/><rect x="50" width="50" height="50" fill="blue"/></svg>',
    ),
  });
  const width = page.getByRole('spinbutton', {
    name: 'Logo width',
    exact: true,
  });
  const height = page.getByRole('spinbutton', {
    name: 'Logo height',
    exact: true,
  });
  await expect(width).toHaveValue('15');
  await expect(height).toHaveValue('7.5');
  await expect(
    page.getByRole('button', { name: 'bottom-right', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('spinbutton', { name: 'Font size', exact: true }),
  ).toHaveCount(0);
  async function pixels() {
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    const base64 = (await readFile((await (await pending).path())!)).toString(
      'base64',
    );
    return page.evaluate(async (encoded) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${encoded}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return [
        Array.from(context.getImageData(1080, 740, 1, 1).data),
        Array.from(context.getImageData(1140, 740, 1, 1).data),
      ];
    }, base64);
  }
  const original = await pixels();
  expect(original[0]![0]).toBeGreaterThan(240);
  expect(original[0]![2]).toBeLessThan(15);
  expect(original[1]![2]).toBeGreaterThan(240);
  await page.getByRole('radio', { name: 'Single color', exact: true }).click();
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  const hex = page.getByRole('textbox', {
    name: 'Custom color (HEX)',
    exact: true,
  });
  await hex.fill('12ab34');
  await page.getByRole('button', { name: 'Apply color', exact: true }).click();
  await hex.press('Escape');
  for (const pixel of await pixels()) {
    expect(Math.abs(pixel[0]! - 18)).toBeLessThan(8);
    expect(Math.abs(pixel[1]! - 171)).toBeLessThan(8);
    expect(Math.abs(pixel[2]! - 52)).toBeLessThan(8);
  }
  await width.fill('20');
  await expect(height).toHaveValue('10');
  await height.fill('5');
  await expect(width).toHaveValue('10');
  await page
    .getByRole('combobox', { name: 'Sizing unit', exact: true })
    .click();
  await page.getByRole('option', { name: 'Pixels (px)', exact: true }).click();
  await expect(width).toHaveValue('80');
  await expect(height).toHaveValue('40');
  await page.getByRole('radio', { name: 'Custom', exact: true }).click();
  await page
    .getByRole('spinbutton', { name: 'X position', exact: true })
    .fill('50');
  await page
    .getByRole('spinbutton', { name: 'Y position', exact: true })
    .fill('50');
  await page.getByLabel('Replace SVG logo').setInputFiles({
    name: 'replacement.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="orange"/></svg>',
    ),
  });
  await expect(height).toHaveValue('80');
  await expect(width).toHaveValue('80');
  await expect(
    page.getByRole('spinbutton', { name: 'X position', exact: true }),
  ).toHaveValue('50');
  await page
    .getByLabel('Choose JPG photo')
    .setInputFiles({ ...photo, name: 'replacement-photo.jpg' });
  await expect(width).toHaveValue('80');
  await expect(
    page.getByRole('spinbutton', { name: 'X position', exact: true }),
  ).toHaveValue('50');
  await page
    .getByRole('button', { name: 'Duplicate container 2', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: /^replacement.svg/ }),
  ).toHaveCount(2);
  await page
    .getByRole('button', { name: 'Delete container 2', exact: true })
    .click();
  await expect(width).toHaveValue('80');
  await page
    .getByRole('button', { name: 'Add container', exact: true })
    .click();
  await expect(
    page.getByRole('textbox', { name: 'Caption', exact: true }),
  ).toHaveAttribute('data-template', '');
  await expect(width).toHaveCount(0);
});
