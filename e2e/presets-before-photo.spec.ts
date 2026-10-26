import { expect, test } from '@playwright/test';

test('edits and saves a layout before import and retains the mounted editor on first photo and replacement', async ({
  page,
}) => {
  await page.goto('/');
  const preset = page.getByRole('combobox', {
    name: 'Saved preset',
    exact: true,
  });
  const caption = page.getByLabel('Caption', { exact: true });
  await expect(preset).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeDisabled();
  expect((await page.locator('header').first().boundingBox())?.height).toBe(48);
  await preset.click();
  await page.getByRole('option', { name: 'Signature', exact: true }).click();
  await expect(caption).toHaveAttribute('data-template', '{author}');
  await caption.fill('Prepared {author}');
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Preset name', exact: true })
    .fill('Before import');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(preset).toContainText('Before import');
  const editorNode = await caption.elementHandle();
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    return canvas.toDataURL('image/png').split(',')[1]!;
  });
  for (const name of ['first.png', 'replacement.png']) {
    await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
      name,
      mimeType: 'image/png',
      buffer: Buffer.from(data, 'base64'),
    });
    await expect(
      page.getByRole('img', { name: `Photo preview: ${name}`, exact: true }),
    ).toBeVisible();
    await expect(caption).toHaveAttribute('data-template', 'Prepared {author}');
    await expect(preset).toContainText('Before import');
    await expect(
      page.getByRole('dialog', { name: 'Manage presets', exact: true }),
    ).toBeVisible();
    expect(await editorNode!.evaluate((node) => node.isConnected)).toBe(true);
    await expect(
      page.getByRole('button', { name: 'Export JPG', exact: true }),
    ).toBeEnabled();
  }
});
