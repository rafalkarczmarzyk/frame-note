import { test, expect } from '@playwright/test';
import { scenes } from './scenes.js';
import { ready, shot } from './helpers.js';
for (const [id, story] of scenes) {
  test(`${id} / composition / ${story}`, async ({ page }) => {
    await page.goto(
      `http://127.0.0.1:6018/iframe.html?id=screens-testphotos--${story}&viewMode=story`,
    );
    await ready(page);
    if (story.includes('glass'))
      await expect(page.locator('[data-glass-ready="true"]')).toBeVisible();
    await shot(page, story);
  });
}
