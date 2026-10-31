import { expect, test } from '@playwright/test';

test('shares selection settings across metadata and independently sized icons', async ({
  page,
}) => {
  await page.goto('/');
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.locator('[data-token="author"]').click();
  const panel = page.getByLabel('Selected element settings', { exact: true });
  await expect(panel).toContainText('Open a photo');
  await expect(editor.getByRole('button', { name: /Remove/ })).toHaveCount(0);
  await panel.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(editor.locator('[data-token="author"]')).toHaveCount(0);
  await editor.click();
  await editor.press('Meta+a');
  await editor.pressSequentially('{icon:camera}{icon:camera}');
  await editor.locator('[data-token="icon:camera"]').first().click();
  await panel.getByLabel('Image height', { exact: true }).fill('2');
  await panel.getByLabel('Image height', { exact: true }).press('Tab');
  await panel.getByRole('radio', { name: 'Bottom', exact: true }).click();
  await expect(
    editor.locator('[data-token="icon:camera:2:font:bottom"]'),
  ).toHaveCount(1);
  await expect(editor.locator('[data-token="icon:camera"]')).toHaveCount(1);
  await panel.getByRole('radio', { name: 'Fixed height', exact: true }).click();
  await expect(panel.getByLabel('Image height', { exact: true })).toHaveValue(
    '4',
  );
  await panel
    .getByRole('radio', { name: 'Relative to font', exact: true })
    .click();
  await expect(panel.getByLabel('Image height', { exact: true })).toHaveValue(
    '2',
  );
  await editor.click();
  await editor.press('Meta+a');
  await editor.press('Meta+c');
  await editor.press('Backspace');
  await editor.press('Meta+v');
  await expect(
    editor.locator('[data-token="icon:camera:2:font:bottom"]'),
  ).toHaveCount(1);
  await editor.locator('[data-token="icon:camera:2:font:bottom"]').click();
  await panel.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(editor.locator('[data-token="icon:camera"]')).toHaveCount(1);
  await expect(
    editor.locator('[data-token="icon:camera:2:font:bottom"]'),
  ).toHaveCount(0);
});

test('keeps icon artwork visible on the photo after resizing', async ({
  page,
}) => {
  await page.goto('/');
  const black = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'black';
    context.fillRect(0, 0, 600, 400);
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'black.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(black, 'base64'),
  });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.click();
  await editor.press('Meta+a');
  await editor.pressSequentially('{icon:camera}');
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('10');
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .press('Tab');
  const canvas = page.locator('[data-photo-canvas] canvas').first();
  const brightPixels = () =>
    canvas.evaluate((node: HTMLCanvasElement) => {
      const pixels = node
        .getContext('2d')!
        .getImageData(0, 0, node.width, node.height).data;
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4)
        if (
          pixels[i]! > 160 &&
          pixels[i + 1]! > 160 &&
          pixels[i + 2]! > 160 &&
          pixels[i + 3]! > 128
        )
          count++;
      return count;
    });
  await expect.poll(brightPixels).toBeGreaterThan(50);
  const before = await brightPixels();
  await editor.locator('[data-token="icon:camera"]').click();
  await page.getByLabel('Image height', { exact: true }).fill('2');
  await page.getByLabel('Image height', { exact: true }).press('Tab');
  await expect(
    editor.locator('[data-token="icon:camera:2:font:center"]'),
  ).toHaveCount(1);
  await expect.poll(brightPixels).toBeGreaterThan(before * 2);
  await page.getByRole('radio', { name: 'Bottom', exact: true }).click();
  await expect.poll(brightPixels).toBeGreaterThan(before * 2);
});

test('top and bottom alignment visibly move text relative to a larger icon', async ({
  page,
}) => {
  await page.goto('/');
  const bytes = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 600;
    c.height = 400;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 600, 400);
    return c.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'alignment.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(bytes, 'base64'),
  });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.click();
  await editor.press('Meta+a');
  await editor.pressSequentially('Photo {icon:camera:3:font:top}');
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('8');
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .press('Tab');
  await editor.locator('[data-token="icon:camera:3:font:top"]').click();
  const canvas = page.locator('[data-photo-canvas] canvas').first();
  const snapshot = () =>
    canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  // Let the selection and loaded artwork finish their first canvas paint.
  await expect
    .poll(() =>
      page.getByRole('button', { name: 'Export JPG', exact: true }).isEnabled(),
    )
    .toBe(true);
  const top = await snapshot();
  await page.getByRole('radio', { name: 'Bottom', exact: true }).click();
  await expect(
    editor.locator('[data-token="icon:camera:3:font:bottom"]'),
  ).toHaveCount(1);
  await expect.poll(snapshot).not.toBe(top);
  const bottom = await snapshot();
  await page.getByRole('radio', { name: 'Center', exact: true }).click();
  await expect.poll(snapshot).not.toBe(bottom);
});
