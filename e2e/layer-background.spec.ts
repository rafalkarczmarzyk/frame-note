import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('layer background controls affect JPG and retain settings under None', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/');
  const source = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 800, 600);
    return c.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'background.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.click();
  await editor.press('ControlOrMeta+a');
  await editor.press('Backspace');
  await editor.pressSequentially('Background test');
  const group = page.getByRole('radiogroup', {
    name: 'Background type',
    exact: true,
  });
  await group.getByRole('radio', { name: 'Color', exact: true }).click();
  const settings = page.getByRole('region', {
    name: 'Background',
    exact: true,
  });
  await settings
    .getByRole('spinbutton', { name: 'Background opacity', exact: true })
    .fill('100');
  await settings
    .getByRole('spinbutton', { name: 'Background opacity', exact: true })
    .press('Tab');
  await settings
    .getByRole('switch', { name: 'Drop shadow', exact: true })
    .click();
  await expect(
    settings.getByRole('group', { name: 'Drop shadow settings' }),
  ).toBeVisible();
  const download = async () => {
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    return readFile((await (await pending).path())!);
  };
  const colored = await download();
  await group.getByRole('radio', { name: 'None', exact: true }).click();
  expect((await download()).equals(colored)).toBe(false);
  await group.getByRole('radio', { name: 'Color', exact: true }).click();
  await expect(
    settings.getByRole('spinbutton', {
      name: 'Background opacity',
      exact: true,
    }),
  ).toHaveValue('100');
  await expect(
    settings.getByRole('switch', { name: 'Drop shadow', exact: true }),
  ).toBeChecked();
  await settings.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath('background-controls.png'),
    fullPage: true,
  });
  // Layers owns the entire inspector, not just its list.
  await page.getByText('Layers', { exact: true }).click();
  await expect(settings).not.toBeVisible();
});
