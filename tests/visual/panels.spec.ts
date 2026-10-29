import { test, expect } from '@playwright/test';
import { openPhoto, shot } from './helpers.js';
for (const [id, trigger, dialog, search] of [
  ['UI-22', 'Browse available tags', 'Available tags', 'Search metadata'],
  ['UI-23', 'Font', 'Choose a font', 'Search fonts'],
  ['UI-24', 'Browse graphics', 'Graphics', ''],
  ['UI-25', 'Color', 'Choose a color', ''],
]) {
  test(`${id} / ${dialog} / open-search-empty`, async ({ page }) => {
    await openPhoto(page);
    await page.getByRole('button', { name: trigger, exact: true }).click();
    const panel = page.getByRole('dialog', { name: dialog, exact: true });
    await expect(panel).toBeVisible();
    await shot(page, 'open');
    if (search) {
      await panel
        .getByRole('textbox', { name: search })
        .fill(dialog === 'Choose a font' ? 'Lora' : 'Canon');
      await shot(page, 'search');
      await panel
        .getByRole('textbox', { name: search })
        .fill('zzzz-no-results-123');
      await shot(page, 'empty');
    }
    if (dialog === 'Choose a color')
      await page
        .getByRole('button', { name: 'Close choose a color', exact: true })
        .click();
    else await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
  });
}
test('UI-26 / presets / menus-and-save', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('combobox', { name: 'Saved preset' }).click();
  await shot(page, 'list');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page
    .getByLabel('Preset name', { exact: true })
    .fill('Long visual regression preset name');
  await shot(page, 'save');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: 'Preset actions', exact: true })
    .click();
  await shot(page, 'actions');
  await page
    .getByRole('menuitem', { name: 'Manage presets', exact: true })
    .click();
  await shot(page, 'manage');
});
test('UI-36 / about / dialog', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await shot(page, 'about');
});
test('UI-25 / custom-color / hex', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Custom color', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Custom color', exact: true });
  await expect(panel).toBeVisible();
  await panel
    .getByRole('textbox', { name: 'Custom color (HEX)', exact: true })
    .fill('#d4a76c');
  await shot(page, 'hex');
});
test('UI-24 / graphics / catalog-tab', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByRole('button', { name: 'Browse graphics', exact: true })
    .click();
  const panel = page.getByRole('dialog', { name: 'Graphics', exact: true });
  await panel.getByRole('radio', { name: 'Graphics', exact: true }).click();
  await shot(page, 'graphics-tab');
});
test('UI-22 / metadata / category-and-scroll', async ({ page }) => {
  await openPhoto(page);
  await page
    .getByRole('button', { name: 'Browse available tags', exact: true })
    .click();
  const panel = page.getByRole('dialog', {
    name: 'Available tags',
    exact: true,
  });
  const radios = panel.getByRole('radio');
  await radios.last().click();
  await shot(page, 'category');
  await panel.getByRole('button').last().scrollIntoViewIfNeeded();
  await shot(page, 'scrolled');
});
