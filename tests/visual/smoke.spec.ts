import { expect, test } from '@playwright/test';
import { openPhoto, ready, shot } from './helpers.js';
import { graphicPreset } from './fixtures/graphics.js';

test('empty editor', async ({ page }) => {
  await page.goto('/');
  await shot(page, 'window');
});

test('prepared photo session', async ({ page }) => {
  await openPhoto(page);
  // Confirm/cancel deletion and retain the current composition in the existing scene.
  await page
    .getByRole('button', { name: 'Preset actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).click();
  const name = page.getByRole('textbox', { name: 'Preset name', exact: true });
  await name.fill('Cancelled copy');
  await expect(
    page.getByRole('button', { name: 'Delete Cancelled copy', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(name).toHaveCount(0);
  await expect(
    page.getByRole('button', {
      name: 'Delete Photo Details copy',
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Duplicate Photo Details', exact: true })
    .click();
  await name.fill('Confirmation check');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page
    .getByRole('option', { name: 'Confirmation check', exact: true })
    .click();
  const templateBeforeDelete = await page
    .getByRole('textbox', { name: 'Caption', exact: true })
    .getAttribute('data-template');
  const remove = page.getByRole('button', {
    name: 'Delete Confirmation check',
    exact: true,
  });
  await remove.click();
  const confirmation = page.getByRole('dialog', {
    name: 'Delete preset?',
    exact: true,
  });
  await expect(confirmation).toContainText('Confirmation check');
  await confirmation
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await expect(remove).toBeVisible();
  await expect(remove).toBeFocused();
  await remove.click();
  await page.keyboard.press('Escape');
  await expect(remove).toBeFocused();
  await remove.click();
  await confirmation
    .getByRole('button', { name: 'Delete preset', exact: true })
    .click();
  await expect(remove).toHaveCount(0);
  await expect(
    page.getByRole('combobox', { name: 'Saved preset', exact: true }),
  ).toHaveText('Photo Details');
  await expect(
    page.getByRole('textbox', { name: 'Caption', exact: true }),
  ).toHaveAttribute('data-template', templateBeforeDelete!);
  await expect(
    page.getByRole('textbox', { name: 'Search presets', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Close manage presets', exact: true })
    .click();

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
  // Disposing the roll must use the app dialog and preserve edits on cancellation.
  const openDispose = async () => {
    await page
      .getByRole('button', { name: 'Photo actions', exact: true })
      .click();
    await page
      .getByRole('menuitem', { name: 'Dispose roll…', exact: true })
      .click();
  };
  const disposeDialog = page.getByRole('dialog', {
    name: 'Dispose roll?',
    exact: true,
  });
  await openDispose();
  await expect(disposeDialog).toContainText('Close all 1 photos');
  await disposeDialog
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await expect(disposeDialog).toHaveCount(0);
  await ready(page);
  await openDispose();
  await page.keyboard.press('Escape');
  await expect(disposeDialog).toHaveCount(0);
  await ready(page);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  });
  await page.locator('[data-photo-view-controls]').scrollIntoViewIfNeeded();
  await ready(page);
  await shot(page, 'window');
  const blendMode = page.getByRole('combobox', {
    name: 'Blend mode',
    exact: true,
  });
  await blendMode.click();
  await page.getByRole('option', { name: 'Multiply', exact: true }).click();
  await expect(blendMode).toHaveText('Multiply');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(blendMode).toHaveText('Normal');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(blendMode).toHaveText('Multiply');
  const layerOpacity = page.getByRole('spinbutton', {
    name: 'Layer opacity value',
    exact: true,
  });
  await layerOpacity.fill('50');
  await layerOpacity.press('Enter');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(layerOpacity).toHaveValue('100');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(layerOpacity).toHaveValue('50');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await blendMode.click();
  await page.getByRole('option', { name: 'Normal', exact: true }).click();
  await page.getByRole('button', { name: 'Add effect', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Outline', exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Thickness', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Hide effect 1', exact: true })
    .click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Hide effect 1', exact: true }),
  ).toBeVisible();
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
  // Exercise per-token date settings inside the existing composition test.
  // Record every export-button state during preset preparation. Its label and
  // dimensions must remain stable while aria-busy and the icon change.
  await page.locator('#export-actions').evaluate((host) => {
    const record = () => {
      const button = host.querySelector<HTMLButtonElement>(
        '[data-export-live] button[aria-label="Export JPG"]',
      );
      if (!button) return;
      const widths = JSON.parse(
        host.getAttribute('data-observed-widths') ?? '[]',
      ) as number[];
      widths.push(button.getBoundingClientRect().width);
      host.setAttribute('data-observed-widths', JSON.stringify(widths));
      if (button.getAttribute('aria-busy') === 'true')
        host.setAttribute('data-observed-busy', 'true');
      if (button.textContent !== 'Export JPG')
        host.setAttribute('data-label-changed', 'true');
    };
    record();
    new MutationObserver(record).observe(host, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-busy'],
    });
  });
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page.getByRole('option', { name: 'Quartz Date', exact: true }).click();
  const dateEditor = page.getByRole('textbox', {
    name: 'Caption',
    exact: true,
  });
  const viewport = page.locator('[data-photo-canvas]');
  await page.getByRole('button', { name: '100%', exact: true }).click();
  await expect(viewport).toHaveAttribute('data-effect-preview-width', '5964');
  await expect(viewport).toHaveAttribute('data-effect-preview-height', '3976');
  await page.getByRole('button', { name: 'Fit', exact: true }).click();
  await expect
    .poll(async () =>
      Number(await viewport.getAttribute('data-effect-preview-width')),
    )
    .toBeLessThan(5964);
  await ready(page);
  const exportStates = page.locator('#export-actions');
  await expect(exportStates).toHaveAttribute('data-observed-busy', 'true');
  await expect(exportStates).not.toHaveAttribute('data-label-changed', 'true');
  const widths = JSON.parse(
    (await exportStates.getAttribute('data-observed-widths'))!,
  ) as number[];
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.1);
  const quartzTemplate = await dateEditor.getAttribute('data-template');
  await dateEditor.locator('[data-token]').click();
  const format = page.getByRole('combobox', {
    name: 'Date format',
    exact: true,
  });
  await expect(format).toHaveText("'YY MM DD");
  await expect(
    page.getByRole('combobox', { name: 'Month style', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('combobox', { name: 'Time format', exact: true }),
  ).toHaveCount(0);
  await format.click();
  await expect(page.getByRole('option')).toHaveText([
    'YYYY-MM-DD',
    'DD.MM.YYYY',
    'D MMM YYYY',
    "'YY MM DD",
    'Custom',
  ]);
  await page.getByRole('option', { name: 'D MMM YYYY', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Date language', exact: true })
    .click();
  await page.getByRole('option', { name: 'Polski', exact: true }).click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    '{date:D%20MMM%20YYYY|pl}',
  );
  await expect(
    page
      .getByLabel('Selected element settings')
      .getByText('Preview: 20 maj 2026', { exact: true }),
  ).toBeVisible();
  // Removed quick choices remain available through Custom.
  await format.click();
  await page.getByRole('option', { name: 'Custom', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Custom date format', exact: true })
    .fill('D MMMM YYYY');
  await page.getByRole('button', { name: 'Apply format', exact: true }).click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    '{date:D%20MMMM%20YYYY|pl}',
  );
  await expect(
    page
      .getByLabel('Selected element settings')
      .getByText('Preview: 20 maja 2026', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await dateEditor.locator('[data-token]').click();

  await format.click();
  await expect(
    page.getByRole('option', { name: 'MM/DD/YYYY', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('option', { name: 'DD.MM.YYYY', exact: true }).click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    '{date:DD.MM.YYYY}',
  );
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(dateEditor).toHaveAttribute('data-template', quartzTemplate!);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    '{date:DD.MM.YYYY}',
  );
  await dateEditor.locator('[data-token]').click();
  await format.click();
  await page.getByRole('option', { name: 'Custom', exact: true }).click();
  const pattern = page.getByRole('textbox', {
    name: 'Custom date format',
    exact: true,
  });
  await pattern.fill('YYYY');
  await expect(
    page.getByRole('button', { name: 'Apply format', exact: true }),
  ).toBeDisabled();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    '{date:DD.MM.YYYY}',
  );
  await pattern.fill('D/M/YYYY');
  await page.getByRole('button', { name: 'Apply format', exact: true }).click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    '{date:D%2FM%2FYYYY}',
  );
  // Time has its own settings and must not expose month/language controls.
  await page.getByRole('button', { name: 'Add content', exact: true }).click();
  await page.getByRole('button', { name: /^time(?:\s|$)/ }).click();
  await page
    .getByRole('button', { name: 'Close add content', exact: true })
    .click();
  await dateEditor.locator('[data-token="time"]').click();
  await expect(
    page.getByRole('combobox', { name: 'Month style', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('combobox', { name: 'Time format', exact: true })
    .click();
  await page
    .getByRole('option', { name: '12-hour · 3:05 PM', exact: true })
    .click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    /\{time:h%3Amm%20A\}/,
  );
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(dateEditor).toHaveAttribute('data-template', /\{time\}/);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(dateEditor).toHaveAttribute(
    'data-template',
    /\{time:h%3Amm%20A\}/,
  );
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page
    .getByRole('option', { name: 'Photo Details', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Discard changes', exact: true })
    .click();

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
  await page
    .getByLabel('Selected image settings', { exact: true })
    .scrollIntoViewIfNeeded();
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
