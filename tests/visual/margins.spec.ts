import { test, expect } from '@playwright/test';
import { openPhoto, ready, shot, section } from './helpers.js';
for (const mode of ['Independent', 'Paired', 'Linked']) {
  for (const side of ['Left', 'Right', 'Top', 'Bottom']) {
    test(`UI-20 / diagram-${side} / ${mode}`, async ({ page }) => {
      await openPhoto(page);
      const sizing = await section(page, 'sizing');
      const radios = page.getByRole('radiogroup', { name: 'Margins linking' });
      if (mode !== 'Independent')
        await radios.getByRole('radio', { name: mode, exact: true }).click();
      const field = sizing.getByRole('spinbutton', { name: side, exact: true });
      await field.hover();
      await shot(page, 'hover', true);
      await expect(sizing).toHaveScreenshot('diagram-hover.png');
      await field.focus();
      await shot(page, 'focus', true);
      await field.blur();
      const handle = page.getByRole('slider', {
        name: `${side} margin`,
        exact: true,
      });
      await handle.hover();
      await shot(page, 'handle', true);
      const b = (await handle.boundingBox())!;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        b.x + b.width / 2 + (side === 'Right' ? -20 : 20),
        b.y + b.height / 2 + (side === 'Bottom' ? -20 : 20),
        { steps: 4 },
      );
      await shot(page, 'dragging', true);
      await page.mouse.up();
      await ready(page);
      await shot(page, 'released');
    });
  }
}
