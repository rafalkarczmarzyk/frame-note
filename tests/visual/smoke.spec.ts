import { expect, test } from '@playwright/test';
import { openPhoto, ready, shot, section } from './helpers.js';
import { graphicPreset } from './fixtures/graphics.js';
import { portraitFixture } from '../fixtures.js';

test('empty editor', async ({ page }) => {
  await page.goto('/');
  await shot(page, 'window');
});

test('photo and editor', async ({ page }) => {
  await openPhoto(page);
  await shot(page, 'window');
});

test('three layers', async ({ page }) => {
  await openPhoto(page);
  for (let i = 0; i < 2; i++)
    await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await ready(page);
  await shot(page, 'window');
});

test('left margin hover', async ({ page }) => {
  await openPhoto(page);
  await section(page, 'sizing');
  await page.getByRole('slider', { name: 'Left margin', exact: true }).hover();
  await shot(page, 'window', true);
});

test('SVG graphic form', async ({ page }) => {
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
  const panel = page.getByLabel('Selected image settings', { exact: true });
  await expect(panel).toBeVisible();
  await panel.scrollIntoViewIfNeeded();
  await shot(page, 'window');
});

test('photo roll', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(portraitFixture.path);
  await expect(
    page.getByRole('region', { name: 'Photo film roll' }),
  ).toBeVisible();
  await shot(page, 'window');
});

test('unavailable font inside selector', async ({ page }) => {
  await openPhoto(page);
  const preset = await graphicPreset('svg', 'font', 'center');
  preset.layout.containers[0]!.style.fontFamily = 'Missing Studio Font';
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'unavailable-font.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  const font = page.getByRole('button', { name: 'Font', exact: true });
  await expect(font.getByText('Unavailable')).toBeVisible();
  await font.scrollIntoViewIfNeeded();
  await ready(page);
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: test.info().outputPath('candidate.png'),
    animations: 'disabled',
    caret: 'hide',
  });
  await shot(page, 'window');
});
