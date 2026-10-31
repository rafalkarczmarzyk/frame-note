import { replaceCaption } from './caption-helpers.js';
import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('renders true italic, exports it and disables unavailable font variants', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  const fontSize = page.getByRole('spinbutton', {
    name: 'Font size',
    exact: true,
  });
  await page
    .getByRole('button', { name: 'Increase Font size', exact: true })
    .click();
  await expect(fontSize).toHaveValue('2.1');
  await fontSize.press('ArrowUp');
  await expect(fontSize).toHaveValue('2.2');
  const lineSpacing = page.getByRole('spinbutton', {
    name: 'Line spacing',
    exact: true,
  });
  await page
    .getByRole('button', { name: 'Increase Line spacing', exact: true })
    .click();
  await expect(lineSpacing).toHaveValue('1.5');
  await lineSpacing.press('ArrowDown');
  await expect(lineSpacing).toHaveValue('1.4');
  await replaceCaption(page, 'Italic Łódź\nBold italic');
  const italic = page.getByRole('button', { name: 'Italic', exact: true });
  await italic.click();
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(italic).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(() =>
      document.fonts.check('italic 700 16px "Montserrat Variable"'),
    ),
  ).toBe(true);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JPG', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/-framenote\.jpg$/);
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await page.getByRole('button', { name: /Advercase/ }).click();
  await expect(italic).toBeDisabled();
  await expect(italic).toHaveAttribute('aria-pressed', 'false');
});
