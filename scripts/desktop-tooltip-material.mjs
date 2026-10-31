import { expect } from '@playwright/test';

/** Check the compiled CSS in Electron, where Safari-only prefixes are ignored. */
export async function verifyTooltipMaterial(page) {
  await page.getByRole('button', { name: 'Add photos', exact: true }).hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  const material = await tooltip.evaluate((node) => ({
    filter: globalThis.getComputedStyle(node).backdropFilter,
    reduced: globalThis.matchMedia('(prefers-reduced-transparency: reduce)')
      .matches,
  }));
  if (material.reduced) {
    expect(material.filter).toBe('none');
  } else {
    expect(material.filter).toContain('blur(16px)');
    expect(material.filter).toContain('saturate(');
  }
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
}
