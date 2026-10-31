import { replaceCaption } from './caption-helpers.js';
import { expect, test } from '@playwright/test';

test('color help supports hover, keyboard, dismissal and viewport edges', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const colors = page.getByRole('group', { name: 'Color', exact: true });
  const ivory = colors.getByRole('button', { name: 'Ivory', exact: true });
  await ivory.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Ivory');
  await expect(ivory).not.toHaveAttribute('title');
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await ivory.focus();
  await expect(tooltip).toHaveText('Ivory');
  await expect(ivory).toHaveAttribute(
    'aria-describedby',
    (await tooltip.getAttribute('id')) as string,
  );
  await ivory.press('Escape');
  await expect(ivory).toBeFocused();
  await expect(tooltip).toHaveCount(0);
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(tooltip).toHaveText('Dark gray');
  const box = await tooltip.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(8);
  expect(box!.x + box!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width - 8,
  );
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await page
    .getByRole('dialog', { name: 'Choose a color' })
    .getByRole('button', { name: 'Sage', exact: true })
    .hover();
  await expect(tooltip).toContainText('Sage');
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'Choose a color' }),
  ).toBeVisible();
});

test('typography and margin help preserves editing and explains unavailable styles', async ({
  page,
}) => {
  await page.goto('/');
  const tooltip = page.getByRole('tooltip');
  const font = page.getByRole('button', { name: 'Font', exact: true });
  await font.hover();
  await expect(tooltip).toHaveText('Choose a font');
  const size = page.getByRole('spinbutton', { name: 'Font size', exact: true });
  await size.focus();
  await expect(tooltip).toHaveText('Font size');
  await expect(size).toHaveAttribute('title', '');
  await size.fill('2.3');
  await size.press('ArrowUp');
  await expect(size).toHaveValue('2.4');
  await size.press('Escape');
  await expect(size).toBeFocused();
  const spacing = page.getByRole('spinbutton', {
    name: 'Line spacing',
    exact: true,
  });
  await spacing.focus();
  await expect(tooltip).toHaveText('Line spacing · multiple of font size');
  const auto = page.getByRole('radio', { name: 'Auto align', exact: true });
  await auto.focus();
  await expect(tooltip).toHaveText('Auto align · follows the layer anchor');
  await auto.press('ArrowRight');
  const left = page.getByRole('radio', { name: 'Align left', exact: true });
  await expect(left).toBeFocused();
  await expect(tooltip).toHaveText('Align left');
  await left.press('Space');
  await expect(left).toBeChecked();
  await font.click();
  await page
    .getByRole('dialog', { name: 'Choose a font' })
    .getByRole('button', { name: /Advercase/ })
    .click();
  await page.getByRole('button', { name: 'Close choose a font' }).click();
  const italic = page.getByRole('button', { name: 'Italic', exact: true });
  await italic.focus();
  await expect(tooltip).toHaveText('Italic is unavailable for this font');
  await expect(italic).toHaveAttribute('aria-disabled', 'true');
  await italic.press('Enter');
  await expect(italic).toHaveAttribute('aria-pressed', 'false');
  await page.getByText('Units & Margins', { exact: true }).click();
  await expect(
    page.getByText('Open a photo to change document units.'),
  ).toBeVisible();
  const individual = page.getByRole('radio', {
    name: 'Individual',
    exact: true,
  });
  await individual.focus();
  await expect(tooltip).toHaveText('Edit each margin independently');
  await individual.press('Space');
  const top = page.getByRole('spinbutton', { name: 'Top', exact: true });
  await top.focus();
  await expect(tooltip).toHaveText('Top margin');
  const description = await top.getAttribute('aria-describedby');
  expect(description).toContain(await tooltip.getAttribute('id'));
  await top.fill('4');
  await top.press('ArrowUp');
  await expect(top).toHaveValue('4.1');
  await page
    .getByRole('button', { name: 'Reset margins', exact: true })
    .hover();
  await expect(tooltip).toHaveText('Reset all margins to 3% of the short edge');
});

test('remaining help explains position, disabled actions and token values without blocking menus', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-export-live]')).toBeVisible();
  const help = page.getByRole('tooltip');
  await page
    .getByRole('button', { name: 'Export JPG', exact: true })
    .locator('..')
    .focus();
  await expect(help).toHaveText('Open a photo to export a JPG');
  await expect(
    page.getByRole('button', { name: 'Photo actions', exact: true }),
  ).toBeDisabled();
  const topLeft = page.getByRole('button', { name: 'top-left', exact: true });
  await topLeft.hover();
  await expect(help).toHaveText('Top left');
  await page.getByRole('radio', { name: 'Manual', exact: true }).click();
  const x = page.getByRole('spinbutton', { name: 'X position', exact: true });
  await x.focus();
  await expect(help).toHaveText(
    'Horizontal position of the layer reference point · % of photo width',
  );
  await x.fill('100');
  await page
    .getByRole('button', { name: 'Increase X position', exact: true })
    .locator('..')
    .hover();
  await expect(help).toHaveText('Maximum x position reached');
  await page
    .getByRole('group', { name: 'Anchor position', exact: true })
    .focus();
  await expect(help).toHaveText('Switch to Anchor to use the position grid');
  await page.locator('[data-token="author"]').hover();
  await expect(help).toHaveText('Open a photo to preview this value');
  const editor = page.getByLabel('Caption', { exact: true });
  await replaceCaption(page, 'Tooltip test {author}');
  await expect(editor).toHaveAttribute(
    'data-template',
    'Tooltip test {author}',
  );
  await page
    .getByRole('button', { name: 'Preset actions', exact: true })
    .click();
  const rename = page.getByRole('menuitem', { name: 'Rename', exact: true });
  await rename.locator('..').hover();
  await expect(help).toHaveText('Built-in presets cannot be renamed');
  await expect(rename).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  const about = page.getByRole('dialog', {
    name: 'Leave your mark.',
    exact: true,
  });
  await expect(about).toBeVisible();
  await expect(about.locator('[data-build-info]')).toHaveText(
    /^v\d+\.\d+\.\d+-(?:alpha|beta|rc) · build (?:[a-f0-9]{7,}|unknown)(?:-dirty)?$/u,
  );
  await about
    .getByRole('button', { name: 'Close about FrameNote', exact: true })
    .focus();
  await expect(about.getByRole('tooltip')).toHaveText('Close About FrameNote');
  await page.keyboard.press('Escape');
  await expect(about).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(about).not.toBeVisible();
});
