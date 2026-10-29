import { test, expect } from '@playwright/test';
import { wildlifeFixture, portraitFixture } from '../fixtures.js';
import { openPhoto, ready, shot } from './helpers.js';
import { replaceCaption } from '../../e2e/caption-helpers.js';
test('UI-02 / before-photo / import', async ({ page }) => {
  await page.goto('/');
  await replaceCaption(page, 'Prepared {icon:camera}');
  await shot(page, 'prepared');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await ready(page);
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'Prepared {icon:camera}',
  );
  await shot(page, 'imported');
});
test('UI-07 / sidebar / limits', async ({ page }) => {
  await openPhoto(page);
  const resize = page.getByRole('separator', { name: 'Sidebar width' });
  for (const key of ['End', 'Home']) {
    await resize.press(key);
    await resize.blur();
    await ready(page);
    await shot(page, key);
  }
});
test('UI-09 / layers / hide-and-order', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await replaceCaption(page, 'Second layer');
  await page
    .getByRole('button', { name: 'Layer 1 actions', exact: true })
    .click();
  await shot(page, 'actions');
  await page
    .getByRole('menuitem', { name: 'Send to back', exact: true })
    .click();
  await ready(page);
  await shot(page, 'reordered');
});
test('UI-11 / layers / empty-and-add', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByRole('button', { name: 'Layer 1 actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveCount(0);
  await shot(page, 'empty-layers');
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await ready(page);
  await shot(page, 'added');
});
test('UI-28 / roll / appearance-switch-close', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(portraitFixture.path);
  await ready(page);
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  await expect(roll).toBeVisible();
  await shot(page, 'portrait-roll');
  await roll.getByRole('button', { name: /20260520/ }).click();
  await ready(page);
  await shot(page, 'landscape-roll');
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  await page
    .getByRole('menuitem', { name: 'Close photo', exact: true })
    .click();
  await expect(roll).toHaveCount(0);
  await ready(page);
  await shot(page, 'single-again');
});
test('UI-29 / roll / twelve-photos', async ({ page }) => {
  await page.goto('/');
  const bytes = Buffer.from(
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#506070';
      context.fillRect(0, 0, 600, 400);
      return canvas.toDataURL('image/jpeg').split(',')[1]!;
    }),
    'base64',
  );
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles(
    Array.from({ length: 12 }, (_, i) => ({
      name: `photo-${String(i + 1).padStart(2, '0')}.jpg`,
      mimeType: 'image/jpeg',
      buffer: bytes,
    })),
  );
  await ready(page);
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  await expect(roll.getByRole('button', { name: /photo-/ })).toHaveCount(12);
  for (const index of [0, 5, 11]) {
    const frame = roll.getByRole('button', { name: /photo-/ }).nth(index);
    await frame.scrollIntoViewIfNeeded();
    await frame.click();
    await ready(page);
    await shot(page, `frame-${index}`);
    await expect(roll).toHaveScreenshot(`roll-${index}.png`);
  }
  const lastFrame = roll.getByRole('button', { name: /photo-/ }).last();
  await page.keyboard.press('Tab');
  await lastFrame.focus();
  await expect(lastFrame).toBeFocused();
  await shot(page, 'keyboard-focus', true);
});
test('UI-30 / roll / restore-document', async ({ page }) => {
  await openPhoto(page);
  await replaceCaption(page, 'First independent document');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(portraitFixture.path);
  await ready(page);
  await replaceCaption(page, 'Second independent document');
  await page
    .getByRole('region', { name: 'Photo film roll' })
    .getByRole('button', { name: /20260520/ })
    .click();
  await ready(page);
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'First independent document',
  );
  await shot(page, 'restored');
});
test('UI-31 / photo-actions / menus', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  await shot(page, 'photo-actions');
});
test('UI-34 / import / corrupt-photo-and-preset', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'broken.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('broken'),
  });
  await expect(page.getByRole('alert').first()).toBeVisible();
  await shot(page, 'photo-error');
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('broken'),
  });
  await shot(page, 'preset-error');
});
test('UI-35 / keyboard / focus-and-tooltip', async ({ page }) => {
  await openPhoto(page);
  const button = page.getByRole('button', {
    name: 'About FrameNote',
    exact: true,
  });
  await button.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await shot(page, 'tooltip', true);
});
test('UI-09 / visibility / hidden', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Hide layer 1', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Show layer 1', exact: true }),
  ).toBeVisible();
  await ready(page);
  await shot(page, 'hidden');
});
test('UI-31 / roll / export-menu-dispose', async ({ page }) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles([wildlifeFixture.path, portraitFixture.path]);
  await ready(page);
  await page
    .getByRole('button', { name: 'Export actions', exact: true })
    .click();
  await shot(page, 'export-all-menu');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  await shot(page, 'dispose-menu');
  let message = '';
  page.once('dialog', async (dialog) => {
    message = dialog.message();
    await dialog.dismiss();
  });
  await page
    .getByRole('menuitem', { name: 'Dispose roll…', exact: true })
    .click();
  expect(message).toContain('2');
  // Native confirmation is checked by its message; browser chrome is outside page screenshots.
});
