import { expect, type Page } from '@playwright/test';
import { wildlifeFixture } from '../fixtures.js';
export async function openPhoto(page: Page, path = wildlifeFixture.path) {
  await page.goto('/');
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles(path);
  await ready(page);
}
async function assetsReady(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((i) => Boolean(i.currentSrc || i.getAttribute('src')))
        .map((i) => i.decode()),
    );
  });
}
export async function ready(page: Page) {
  await expect(
    page.locator('[data-photo-canvas] canvas').first(),
  ).toBeVisible();
  await expect(
    page.locator('[data-export-live] button[aria-label="Export JPG"]'),
  ).toBeEnabled();
  await assetsReady(page);
}
export async function shot(page: Page, name: string, hover = false) {
  if (await page.locator('[data-photo-canvas] canvas').count())
    await ready(page);
  else await assetsReady(page);
  const fontPanel = page.getByRole('dialog', { name: 'Choose a font' });
  if (await fontPanel.count()) {
    await expect
      .poll(
        () =>
          fontPanel.evaluate((panel) => {
            const bounds = panel.getBoundingClientRect();
            return [
              ...panel.querySelectorAll<HTMLElement>('[data-font-preview]'),
            ]
              .filter((node) => {
                const r = node.getBoundingClientRect();
                return (
                  r.bottom > Math.max(0, bounds.top) &&
                  r.top < Math.min(innerHeight, bounds.bottom) &&
                  node.dataset.fontPreviewStatus !== 'ready'
                );
              })
              .map((node) => node.dataset.fontPreview);
          }),
        {
          message: 'Visible font samples must finish loading before comparison',
        },
      )
      .toEqual([]);
  }
  await page.evaluate(() => document.fonts.ready);
  if (!hover) {
    await page.mouse.move(0, 0);
    await expect
      .poll(
        () =>
          page
            .locator('button:hover, input:hover, [role="slider"]:hover')
            .count(),
        { message: 'Neutral screenshots must not retain a control hover' },
      )
      .toBe(0);
  }
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(page).toHaveScreenshot(`${name}.png`);
}
export async function section(page: Page, key: string) {
  const details = page.locator(`details[data-section="${key}"]`);
  if ((await details.getAttribute('open')) === null)
    await details.locator('summary').click();
  await details.scrollIntoViewIfNeeded();
  return details;
}
