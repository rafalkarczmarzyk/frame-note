import { expect, test, type Page } from '@playwright/test';
import { wildlifeFixture } from '../fixtures.js';
import { replaceCaption } from '../../e2e/caption-helpers.js';
async function ready(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
}
test('UI-01 / empty / desktop', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('empty.png');
});
for (const count of [1, 3, 12]) {
  test(`UI-08 / layers-${count} / selected`, async ({ page }) => {
    await page.goto('/');
    await page
      .getByLabel('Choose JPG or PNG photo')
      .setInputFiles(wildlifeFixture.path);
    for (let i = 1; i < count; i++)
      await page
        .getByRole('button', { name: 'Add layer', exact: true })
        .click();
    await ready(page);
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot(`layers-${count}.png`);
  });
}
for (const side of ['Left', 'Right', 'Top', 'Bottom']) {
  test(`UI-20 / ${side.toLowerCase()}-hover / none`, async ({ page }) => {
    await page.goto('/');
    await page
      .getByLabel('Choose JPG or PNG photo')
      .setInputFiles(wildlifeFixture.path);
    await page.locator('details[data-section="sizing"] > summary').click();
    await ready(page);
    await page
      .getByRole('slider', { name: `${side} margin`, exact: true })
      .hover();
    await expect(page).toHaveScreenshot(`margin-${side.toLowerCase()}.png`);
  });
}
test('UI-14 / icon / selected', async ({ page }) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await replaceCaption(page, 'Photo {icon:camera}');
  await page.locator('[data-token="icon:camera"]').first().click();
  await expect(
    page.getByLabel('Selected element settings', { exact: true }),
  ).toBeVisible();
  await ready(page);
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot('icon-settings.png');
});
