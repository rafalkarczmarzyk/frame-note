import { expect, test } from '@playwright/test';

test('color help supports hover, keyboard, dismissal and viewport edges', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const colors = page.getByRole('group', { name: 'Color', exact: true });
  const ivory = colors.getByRole('button', { name: 'Ivory', exact: true });
  await ivory.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Ivory');
  await expect(ivory).not.toHaveAttribute('title');
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await ivory.focus();
  await expect(tooltip).toHaveText('Ivory');
  await expect(ivory).toHaveAttribute(
    'aria-describedby',
    (await tooltip.getAttribute('id')) as string,
  );
  await ivory.press('Escape');
  await expect(ivory).toBeFocused();
  await expect(tooltip).toHaveCount(0);
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(tooltip).toHaveText('Dark gray');
  const box = await tooltip.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(8);
  expect(box!.x + box!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width - 8,
  );
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await page
    .getByRole('dialog', { name: 'Choose a color' })
    .getByRole('button', { name: 'Sage', exact: true })
    .hover();
  await expect(tooltip).toContainText('Sage');
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'Choose a color' }),
  ).toBeVisible();
});
