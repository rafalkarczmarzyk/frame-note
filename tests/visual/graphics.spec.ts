import { test, expect, type Page } from '@playwright/test';
import { openPhoto, ready, shot } from './helpers.js';
import { graphicPreset, type GraphicFormat } from './fixtures/graphics.js';

async function prepare(
  page: Page,
  format: GraphicFormat,
  unit: 'font' | 'document',
  align: 'top' | 'center' | 'bottom',
  color = 'original',
  height?: number,
) {
  await openPhoto(page);
  const preset = await graphicPreset(format, unit, align, color, height);
  await page
    .getByLabel('Import preset file')
    .setInputFiles({
      name: 'visual-graphics.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(preset)),
    });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await expect(editor).toHaveAttribute(
    'data-template',
    preset.layout.containers[0]!.template,
  );
  await ready(page);
  await editor.locator('[data-token]').last().click();
  const panel = page.getByLabel(
    format === 'icon' ? 'Selected element settings' : 'Selected image settings',
    { exact: true },
  );
  await expect(panel).toBeVisible();
  await panel.scrollIntoViewIfNeeded();
  return { panel, editor };
}
for (const format of ['svg', 'png', 'icon'] as const) {
  for (const unit of ['font', 'document'] as const) {
    for (const align of ['top', 'center', 'bottom'] as const) {
      test(`${format === 'icon' ? 'UI-14' : 'UI-15'} / ${format} / ${unit}-${align}`, async ({
        page,
      }) => {
        const { panel } = await prepare(page, format, unit, align);
        await expect(
          panel.getByRole('radio', {
            name: unit === 'font' ? 'Relative to font' : 'Fixed height',
            exact: true,
          }),
        ).toBeChecked();
        await expect(
          panel.getByRole('radio', { name: new RegExp(`^${align}$`, 'i') }),
        ).toBeChecked();
        await shot(page, 'form');
        await expect(panel).toHaveScreenshot('settings.png');
      });
    }
  }
}
test('UI-15 / svg / single-color', async ({ page }) => {
  const { panel } = await prepare(page, 'svg', 'font', 'center', 'single');
  await expect(
    panel.getByRole('radio', { name: 'Layer color', exact: true }),
  ).toBeChecked();
  await shot(page, 'single');
});
test('UI-15 / graphic / replace-remove', async ({ page }) => {
  const { panel, editor } = await prepare(page, 'svg', 'font', 'center');
  await panel.getByRole('button', { name: 'Replace graphic' }).click();
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/rt.png');
  await ready(page);
  await editor.locator('[data-token]').last().click();
  await expect(panel).toContainText('rt.png');
  await shot(page, 'replaced');
  await panel.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(panel).toHaveCount(0);
  await shot(page, 'removed');
});
test('UI-14 / icon / resize', async ({ page }) => {
  const { panel, editor } = await prepare(page, 'icon', 'font', 'center');
  const height = panel.getByLabel('Image height', { exact: true });
  await height.press('ArrowUp');
  await expect(editor).toHaveAttribute(
    'data-template',
    'Photo {icon:camera:2.1:font:center}',
  );
  await shot(page, 'resized');
});
test('UI-15 / png / resolution-warning', async ({ page }) => {
  const { panel } = await prepare(
    page,
    'png',
    'font',
    'center',
    'original',
    30,
  );
  await expect(panel.getByText(/Larger than the source/)).toBeVisible();
  await shot(page, 'warning');
});
