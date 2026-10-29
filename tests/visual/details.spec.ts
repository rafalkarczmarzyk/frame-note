import { test, expect } from '@playwright/test';
import { portraitFixture } from '../fixtures.js';
import { openPhoto, ready, shot, section } from './helpers.js';
import { replaceCaption } from '../../e2e/caption-helpers.js';

test('UI-13 / metadata / before-import', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-token="author"]').click();
  await expect(
    page.getByLabel('Selected element settings', { exact: true }),
  ).toContainText('Open a photo');
  await shot(page, 'no-photo');
});
test('UI-12 / content / mixed-long-text', async ({ page }) => {
  await openPhoto(page);
  await replaceCaption(
    page,
    'Long text with {author} and {icon:camera}\n\nA deliberately long line which wraps inside the editor while preserving the actual caption paragraphs.',
  );
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/frame-note-logo.svg');
  await ready(page);
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/rt.png');
  await ready(page);
  await shot(page, 'mixed');
});
test('UI-17 / background / asymmetric-padding', async ({ page }) => {
  await openPhoto(page);
  const background = page.getByRole('region', {
    name: 'Background',
    exact: true,
  });
  await background.getByRole('radio', { name: 'Color', exact: true }).click();
  await background
    .getByRole('radiogroup', { name: 'Padding linking' })
    .getByRole('radio', { name: 'Individual', exact: true })
    .click();
  for (const [name, value] of [
    ['Top', '1'],
    ['Right', '2'],
    ['Bottom', '3'],
    ['Left', '4'],
  ] as const) {
    await background.getByRole('spinbutton', { name, exact: true }).fill(value);
  }
  await background
    .getByRole('spinbutton', { name: 'Left', exact: true })
    .press('Tab');
  await shot(page, 'padding');
  await expect(background).toHaveScreenshot('padding-controls.png');
});
for (const target of ['base', 'shadow']) {
  test(`UI-25 / background-palette / ${target}`, async ({ page }) => {
    await openPhoto(page);
    const background = page.getByRole('region', {
      name: 'Background',
      exact: true,
    });
    await background.getByRole('radio', { name: 'Color', exact: true }).click();
    if (target === 'shadow')
      await background.getByRole('switch', { name: 'Drop shadow' }).click();
    const host =
      target === 'base'
        ? background.getByRole('group', {
            name: 'Background color',
            exact: true,
          })
        : background.getByRole('group', {
            name: 'Drop shadow settings',
            exact: true,
          });
    await host.getByRole('button', { name: 'Color', exact: true }).click();
    await expect(
      background.getByRole('dialog', { name: 'Choose a color' }),
    ).toBeVisible();
    await shot(page, 'palette');
    await background
      .getByRole('dialog', { name: 'Choose a color' })
      .getByRole('button', { name: 'Close choose a color' })
      .click();
    await host
      .getByRole('button', { name: 'Custom color', exact: true })
      .click();
    const custom = page.getByRole('dialog', {
      name: 'Custom color',
      exact: true,
    });
    await expect(custom).toBeVisible();
    await custom
      .getByRole('textbox', { name: 'Custom color (HEX)', exact: true })
      .fill('#aabbcc');
    await shot(page, 'custom');
  });
}
test('UI-20 / portrait / ruler-hover', async ({ page }) => {
  await openPhoto(page, portraitFixture.path);
  await section(page, 'sizing');
  for (const axis of ['Horizontal', 'Vertical']) {
    await page
      .getByRole('group', { name: new RegExp(`^${axis} margin ruler`) })
      .hover();
    await shot(page, axis, true);
  }
});
test('UI-23 / font / category-selected', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Choose a font' });
  await panel.getByRole('textbox', { name: 'Search fonts' }).fill('Lora');
  await panel.getByRole('radio', { name: 'Serif', exact: true }).click();
  await panel.getByRole('button', { name: /Lora/ }).click();
  await ready(page);
  await shot(page, 'category-selected');
});
test('UI-26 / preset / save-as', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByRole('button', { name: 'Preset actions', exact: true })
    .click();
  await page
    .getByRole('menuitem', { name: 'Save as new', exact: true })
    .click();
  await page
    .getByLabel('Preset name', { exact: true })
    .fill('Separate layout variation');
  await shot(page, 'save-as');
});
test('UI-27 / export / quality-and-warning', async ({ page }) => {
  await openPhoto(page);
  await replaceCaption(page, '{exif:DefinitelyUnknown}');
  await section(page, 'export');
  await page
    .getByRole('radiogroup', { name: 'JPEG quality presets' })
    .getByRole('radio', { name: 'Balanced', exact: true })
    .click();
  await expect(
    page.getByRole('slider', { name: 'JPEG quality', exact: true }),
  ).toHaveAttribute('aria-valuenow', '75');
  await shot(page, 'warning');
  const confirmation = page.waitForEvent('dialog').then(async (dialog) => {
    const type = dialog.type();
    const message = dialog.message();
    await dialog.dismiss();
    expect(type).toBe('confirm');
    expect(message).toBe(
      'Some tokens could not be resolved. Export the current caption anyway?',
    );
  });
  await page.getByRole('button', { name: 'Export JPG', exact: true }).click();
  await confirmation;
});
test('UI-34 / graphic / invalid-upload', async ({ page }) => {
  await openPhoto(page);
  await page.getByLabel('Upload image', { exact: true }).setInputFiles({
    name: 'broken.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg><script>alert(1)</script></svg>'),
  });
  await expect(page.getByRole('alert').first()).toBeVisible();
  await shot(page, 'graphic-error');
});
