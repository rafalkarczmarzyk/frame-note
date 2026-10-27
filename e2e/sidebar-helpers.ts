import type { Page } from '@playwright/test';

/** Settings start collapsed; tests open the controls they actually exercise. */
export async function openSidebarSection(page: Page, title: string) {
  const label = page.getByText(title, { exact: true });
  const section = page.locator('details').filter({ has: label });
  if ((await section.getAttribute('open')) === null) await label.click();
}
