import { test, expect } from '@playwright/test';
import { openPhoto, ready, shot } from './helpers.js';
import { replaceCaption } from '../../e2e/caption-helpers.js';
test('UI-19 / typography / styles', async ({ page }) => {
  await openPhoto(page);
  await replaceCaption(page, 'FrameNote Żółw © · ×\nSecond line');
  for (const name of ['Bold', 'Italic']) {
    await page.getByRole('button', { name, exact: true }).click();
    await ready(page);
    await shot(page, name);
  }
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await page.getByRole('button', { name: /Advercase/ }).click();
  await page.keyboard.press('Escape');
  await ready(page);
  await shot(page, 'advercase');
});
test('UI-10 / layers / long-list-last-first', async ({ page }) => {
  await openPhoto(page);
  for (let i = 1; i < 12; i++) {
    await page.getByRole('button', { name: 'Add layer', exact: true }).click();
    await replaceCaption(
      page,
      `Layer ${i} long label for visual overflow {icon:camera}`,
    );
    if (i === 3 || i === 4) {
      await page
        .getByLabel('Upload image', { exact: true })
        .setInputFiles(
          `tests/fixtures/logos/${i === 3 ? 'frame-note-logo.svg' : 'rt.png'}`,
        );
      await ready(page);
    }
  }
  const rows = page.locator('[data-picker-choice]');
  await expect(rows).toHaveCount(12);
  for (const i of [11, 0]) {
    await rows.nth(i).scrollIntoViewIfNeeded();
    await rows.nth(i).click();
    await ready(page);
    await shot(page, `selected-${i}`);
  }
});
