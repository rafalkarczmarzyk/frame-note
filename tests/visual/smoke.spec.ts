import { expect, test } from '@playwright/test';
import { openPhoto, ready, shot } from './helpers.js';
import { graphicPreset } from './fixtures/graphics.js';

test('empty editor', async ({ page }) => {
  await page.goto('/');
  await shot(page, 'window');
});

test('prepared photo session', async ({ page }) => {
  await openPhoto(page);
  for (let i = 0; i < 2; i++)
    await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await ready(page);
  await shot(page, 'window');
});

test('font panel', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Choose a font' }),
  ).toBeVisible();
  await shot(page, 'window');
});

test('metadata panel', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Add content', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Add content' })).toBeVisible();
  await shot(page, 'window');
});

test('graphic settings', async ({ page }) => {
  await openPhoto(page);
  const preset = await graphicPreset('svg', 'font', 'center');
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'visual-graphics.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await expect(editor).toHaveAttribute(
    'data-template',
    preset.layout.containers[0]!.template,
  );
  await editor.locator('[data-token]').last().click();
  await expect(
    page.getByLabel('Selected image settings', { exact: true }),
  ).toBeVisible();
  await shot(page, 'window');
});

test('About', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  await shot(page, 'window');
});
