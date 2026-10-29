import { test, expect } from '@playwright/test';
import { openPhoto } from './helpers.js';
/** Runs without changing references: each deliberate regression must reject the saved screenshot. */
test('UI-03 / sensitivity / deliberate-regressions', async ({
  page,
}, testInfo) => {
  await openPhoto(page);
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot('stable.png');
  const baseline = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
  });
  for (const css of [
    'aside { transform: translateX(1px) !important; }',
    'button svg { visibility: hidden !important; }',
    'button { min-height: 40px !important; }',
  ]) {
    const style = await page.addStyleTag({ content: css });
    const actual = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
    });
    expect(
      actual.equals(baseline),
      `Deliberate regression was invisible: ${css}`,
    ).toBe(false);
    if (testInfo.config.updateSnapshots === 'none') {
      let rejected = false;
      try {
        await expect(page).toHaveScreenshot('stable.png', { timeout: 1500 });
      } catch {
        rejected = true;
      }
      expect(
        rejected,
        `Screenshot comparator accepted a deliberate regression: ${css}`,
      ).toBe(true);
    }
    await testInfo.attach(`mutation-${css.slice(0, 6)}`, {
      body: actual,
      contentType: 'image/png',
    });
    await style.evaluate((node) => (node as HTMLElement).remove());
  }
});
