import { expect, test } from '@playwright/test';

test('saves and restores a layout after reload and imports an exported preset', async ({
  page,
}) => {
  await page.goto('/');
  // Generate a small local image so this flow does not depend on fixture filenames.
  const data = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    return c.toDataURL('image/jpeg').split(',')[1]!;
  });
  const photo = {
    name: 'preset.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(data, 'base64'),
  };
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await page.getByLabel('Caption', { exact: true }).fill('Saved {author}');
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page.getByLabel('Preset name', { exact: true }).fill('Wildlife');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByLabel('Caption', { exact: true }).fill('Changed');
  await expect(
    page.getByText('Unsaved changes', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByRole('button', { name: 'Wildlife', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'Saved {author}',
  );
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Duplicate Wildlife', exact: true })
    .click();
  await page
    .getByLabel('Preset name', { exact: true })
    .fill('Wildlife copy renamed');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Wildlife copy renamed', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Delete Wildlife copy renamed', exact: true })
    .click();
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Export preset', exact: true })
    .click();
  const path = await (await pending).path();
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Delete Wildlife', exact: true })
    .click();
  await page.getByLabel('Import preset file').setInputFiles(path!);
  await expect(
    page.getByRole('combobox', { name: 'Saved preset', exact: true }),
  ).toContainText('Wildlife');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'Saved {author}',
  );
});

test('offers built-in Default and Macro and resolves the Helicon fixture', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG photo')
    .setInputFiles('tests/fixtures/20261020-2026-10-20 14-06-39 (A,R8,S4).jpg');
  await page.getByRole('combobox', { name: 'Saved preset' }).click();
  await page.getByRole('option', { name: 'Default dark', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Manage presets' }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByRole('button', { name: 'Macro', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Manage presets' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Default dark', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Manage presets' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Macro', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{heliconStack}',
  );
  await expect(
    page.getByRole('button', { name: 'Delete Wildlife', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Update preset', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Browse available tags', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Available tags' }),
  ).toContainText('Focus stack · 15 images · Method A · R=8 · S=4');
  await page.getByRole('button', { name: 'Close available tags' }).click();
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{author}\n{lens}\n{exposure}',
  );
});
