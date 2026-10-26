import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('adds SVG through container content and exports original and single colors', async ({
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
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles(photo);
  await page.getByLabel('Caption', { exact: true }).press('ControlOrMeta+a');
  await page.getByLabel('Caption', { exact: true }).press('Backspace');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '',
  );
  await expect(
    page.getByRole('button', { name: 'Add logo', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Upload image', { exact: true }).setInputFiles({
    name: 'two-colors.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="50" height="50" fill="red"/><rect x="50" width="50" height="50" fill="blue"/></svg>',
    ),
  });
  await page.getByRole('img', { name: 'two-colors.svg', exact: true }).click();
  await page.getByRole('radio', { name: 'Fixed height', exact: true }).click();
  const height = page.getByRole('spinbutton', {
    name: 'Image height',
    exact: true,
  });
  await height.fill('7.5');
  await page.getByRole('button', { name: 'bottom-right', exact: true }).click();
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
  await page.getByRole('img', { name: 'two-colors.svg', exact: true }).click();
  await page.getByRole('radio', { name: 'Layer color', exact: true }).click();
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  const hex = page.getByRole('textbox', {
    name: 'Custom color (HEX)',
    exact: true,
  });
  await hex.fill('12ab34');
  await hex.press('Escape');
  for (const pixel of await pixels()) {
    expect(Math.abs(pixel[0]! - 18)).toBeLessThan(8);
    expect(Math.abs(pixel[1]! - 171)).toBeLessThan(8);
    expect(Math.abs(pixel[2]! - 52)).toBeLessThan(8);
  }
  await page.getByRole('img', { name: 'two-colors.svg', exact: true }).click();
  await expect(height).toHaveValue('7.5');
  await page.getByRole('img', { name: 'two-colors.svg', exact: true }).click();
  await page.getByRole('button', { name: 'Remove image', exact: true }).click();
  await expect(
    page.getByRole('img', { name: 'two-colors.svg', exact: true }),
  ).toHaveCount(0);
});
