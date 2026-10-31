import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('uploads SVG, edits atomic tokens, round-trips the clipboard and exports a tinted icon', async ({
  page,
}) => {
  await page.goto('/');
  const initialEditor = page.getByRole('textbox', {
    name: 'Caption',
    exact: true,
  });
  await expect(initialEditor.locator('[data-token="author"]')).toBeVisible();
  await expect(initialEditor.locator('[data-missing]')).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: 'Empty:' }),
  ).toHaveCount(0);
  const black = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'black';
    context.fillRect(0, 0, 1200, 800);
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'black.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(black, 'base64'),
  });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await expect(editor.locator('[data-token="author"]')).toHaveAttribute(
    'data-value-status',
    'empty',
  );
  await expect(
    page.getByRole('status').filter({ hasText: 'Empty:' }),
  ).toBeVisible();
  await editor.click();
  await editor.press('Meta+a');
  await editor.press('Backspace');
  await expect(editor).toHaveAttribute('data-template', '');
  await page.getByRole('button', { name: 'Add content', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Add content', exact: true });
  await panel.getByRole('button', { name: 'Icons', exact: true }).click();
  await expect(panel.getByLabel('Upload SVG icon')).toHaveCount(0);
  await expect(
    panel.getByRole('button', { name: 'Back to caption' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'camera', exact: true }).click();
  await expect(editor.locator('[data-token="icon:camera"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  const upload = page.getByLabel('Upload image', { exact: true });
  await upload.setInputFiles({
    name: 'bad.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script></svg>',
    ),
  });
  await expect(page.getByRole('alert')).toContainText(
    'Unsupported SVG element',
  );
  await editor.click();
  await editor.press('Meta+a');
  await editor.press('Backspace');
  await upload.setInputFiles({
    name: 'square.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="black"/></svg>',
    ),
  });
  const imageToken = editor.locator('[data-token^="image:"]');
  await expect(imageToken).toHaveCount(1);
  await imageToken.click();
  const layerColor = page.getByRole('radio', {
    name: 'Layer color',
    exact: true,
  });
  await layerColor.focus();
  await layerColor.press('Space');
  const imageTemplate = await editor.getAttribute('data-template');
  await editor.click();
  await editor.press('Meta+a');
  await editor.press('Meta+c');
  await editor.press('Backspace');
  await expect(editor).toHaveAttribute('data-template', '');
  await editor.press('Meta+v');
  await expect(editor).toHaveAttribute('data-template', imageTemplate!);
  await expect(editor.locator('[data-token^="image:"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Custom color', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Custom color (HEX)', exact: true })
    .fill('12ab34');
  await page
    .getByRole('textbox', { name: 'Custom color (HEX)', exact: true })
    .press('Escape');
  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(button).toBeEnabled();
  const pending = page.waitForEvent('download');
  await button.click();
  const encoded = (await readFile((await (await pending).path())!)).toString(
    'base64',
  );
  const pixel = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    // 3% margin = 24px, icon height = 16px, line height = 22.4px.
    return Array.from(context.getImageData(32, 765, 1, 1).data);
  }, encoded);
  expect(Math.abs(pixel[0]! - 18)).toBeLessThan(8);
  expect(Math.abs(pixel[1]! - 171)).toBeLessThan(8);
  expect(Math.abs(pixel[2]! - 52)).toBeLessThan(8);
  await editor.click();
  await editor.press('Meta+a');
  await editor.pressSequentially('{icon:absent}');
  await expect(editor.locator('[data-token="icon:absent"]')).toHaveAttribute(
    'data-missing',
    'true',
  );
  await expect(
    page.getByRole('status').filter({ hasText: 'Missing images or icons:' }),
  ).toContainText('icon:absent');
});
