import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('keeps category controls fixed and waits for an on-demand font before export', async ({
  page,
}) => {
  const fontRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/fonts/google/'))
      fontRequests.push(request.url());
  });
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await page.getByLabel('Caption', { exact: true }).fill('Leave your mark.');
  const exportButton = page.getByRole('button', {
    name: 'Export JPG',
    exact: true,
  });
  await expect(exportButton).toBeEnabled();
  expect(fontRequests).toEqual([]);

  let releaseFont!: () => void;
  const fontGate = new Promise<void>((resolve) => {
    releaseFont = resolve;
  });
  await page.route('**/fonts/google/lora/*.woff2', async (route) => {
    await fontGate;
    await route.continue();
  });
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Choose a font' });
  const all = panel.getByRole('radio', { name: 'All', exact: true });
  const before = await all.boundingBox();
  const search = panel.getByRole('textbox', { name: 'Search fonts' });
  await search.fill('nothing matches');
  await expect(panel.getByText('No matching fonts.')).toBeVisible();
  expect(await all.boundingBox()).toEqual(before);
  await search.fill('Lora');
  await panel.getByRole('radio', { name: 'Serif', exact: true }).click();
  await panel.getByRole('button', { name: /Lora/ }).click();
  await expect(exportButton).toBeDisabled();
  releaseFont();
  await expect(exportButton).toBeEnabled();
  expect(
    await page.evaluate(() =>
      document.fonts.check('400 16px "Lora"', 'Leave your mark.'),
    ),
  ).toBe(true);
  await panel.getByRole('radio', { name: 'Monospace' }).click();
  await expect(panel.getByText('No matching fonts.')).toBeVisible();
  await panel.getByRole('radio', { name: 'Serif', exact: true }).click();
  await expect(panel.getByRole('button', { name: /Lora/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const download = page.waitForEvent('download');
  await exportButton.click();
  expect((await download).suggestedFilename()).toMatch(/-framenote\.jpg$/);
});
