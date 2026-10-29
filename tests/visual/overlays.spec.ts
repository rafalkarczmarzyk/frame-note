import { test, expect } from '@playwright/test';
import { openPhoto, shot } from './helpers.js';
for (const [id, story] of [
  ['UI-32', 'components-ui-photoloadingindicator--cancellable'],
  ['UI-32', 'screens-startupredesign--loading-preview'],
  ['UI-33', 'screens-startupredesign--dragging-photo'],
]) {
  test(`${id} / overlay / ${story}`, async ({ page }) => {
    await page.goto(
      `http://127.0.0.1:6018/iframe.html?id=${story}&viewMode=story`,
    );
    if (id === 'UI-32')
      await expect(page.getByRole('status').first()).toBeVisible();
    else await expect(page.getByText(/Drop/).first()).toBeVisible();
    await shot(page, 'overlay');
  });
}
test('UI-33 / content / drop-overlay', async ({ page }) => {
  await openPhoto(page);
  await page.locator('section[aria-label="Content"]').evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File(['<svg/>'], 'test.svg', { type: 'image/svg+xml' }),
    );
    element.dispatchEvent(
      new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
  });
  await expect(page.getByText('Drop an image', { exact: true })).toBeVisible();
  await shot(page, 'content-drop');
});
