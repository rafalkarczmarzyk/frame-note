import { expect, test } from '@playwright/test';
import { openPhoto, ready, shot } from './helpers.js';
import { graphicPreset } from './fixtures/graphics.js';

test('empty editor', async ({ page }) => {
  await page.goto('/');
  await shot(page, 'window');
});

test('prepared photo session', async ({ page }) => {
  await openPhoto(page);
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  const initial = await editor.getAttribute('data-template');
  await editor.click();
  await editor.evaluate((element) => {
    const range = document.createRange();
    range.setStart(element.firstChild!, 0);
    range.collapse(true);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await editor.pressSequentially('History check');
  await expect(editor).toHaveAttribute(
    'data-template',
    `History check${initial}`,
  );
  await editor.press('Control+z');
  await expect(editor).toHaveAttribute('data-template', initial!);
  await editor.press('Control+Shift+z');
  await expect(editor).toHaveAttribute(
    'data-template',
    `History check${initial}`,
  );
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(editor).toHaveAttribute('data-template', initial!);
  const fontSize = page.getByRole('spinbutton', {
    name: 'Font size',
    exact: true,
  });
  const initialSize = await fontSize.inputValue();
  await fontSize.fill('3');
  await fontSize.fill('4');
  await fontSize.fill('5');
  await fontSize.press('Enter');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(fontSize).toHaveValue(initialSize);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(fontSize).toHaveValue('5');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
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
  const initialTemplate = await page
    .getByRole('textbox', { name: 'Caption', exact: true })
    .getAttribute('data-template');
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
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(editor).toHaveAttribute('data-template', initialTemplate!);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(editor).toHaveAttribute(
    'data-template',
    preset.layout.containers[0]!.template,
  );
  await editor.locator('[data-token]').last().click();
  await expect(
    page.getByLabel('Selected image settings', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove layer', exact: true }).click();
  await expect(editor).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(editor).toHaveAttribute(
    'data-template',
    preset.layout.containers[0]!.template,
  );
  await expect(
    page.getByLabel('Selected image settings', { exact: true }),
  ).toBeVisible();
  await editor.focus();
  await shot(page, 'window');
});

test('About', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  await shot(page, 'window');
});
