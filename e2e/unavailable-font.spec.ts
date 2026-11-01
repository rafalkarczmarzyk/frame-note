import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.js';

test('keeps an unavailable font inside its selector and clears the badge on explicit selection', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  const preset = JSON.parse(
    readFileSync('tests/fixtures/presets/v1.json', 'utf8'),
  );
  preset.layout.containers[0].style.fontFamily = 'Missing Studio Font';
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'missing.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  const font = page.getByRole('button', { name: 'Font', exact: true });
  await expect(font).toContainText('Missing Studio Font');
  await expect(font.getByText('Unavailable')).toBeVisible();
  await expect(
    page.locator('[data-export-live] button[aria-label="Export JPG"]'),
  ).toBeEnabled();
  const exportButton = page.locator(
    '[data-export-live] button[aria-label="Export JPG"]',
  );
  const fallbackDownload = page.waitForEvent('download');
  await exportButton.click();
  const fallbackBytes = readFileSync((await (await fallbackDownload).path())!);
  await font.click();
  const panel = page.getByRole('dialog', { name: 'Choose a font' });
  await expect(
    panel.getByRole('radio', { name: 'System', exact: true }),
  ).toHaveCount(0);
  await panel.getByRole('button', { name: /Montserrat/ }).click();
  await expect(font).toContainText('Montserrat');
  await expect(font.getByText('Unavailable')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(exportButton).toBeEnabled();
  const explicitDownload = page.waitForEvent('download');
  await exportButton.click();
  expect(readFileSync((await (await explicitDownload).path())!)).toEqual(
    fallbackBytes,
  );
});
