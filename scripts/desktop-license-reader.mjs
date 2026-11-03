// SPDX-License-Identifier: GPL-3.0-or-later
import { expect } from '@playwright/test';

export async function verifyDesktopLicenseReader(app, page, native = false) {
  await page.context().setOffline(true);
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].webContents.send('menu-command', 'about');
  });
  await page.getByRole('link', { name: 'Licenses', exact: true }).click();
  const text = page.getByLabel('Full licenses and notices');
  await expect(text).toContainText('GNU GENERAL PUBLIC LICENSE');
  await expect(text).toContainText(
    'These photographs are not licensed under the GNU GPL',
  );
  if (native) {
    await page
      .getByRole('button', {
        name: 'Electron and Chromium notices',
        exact: true,
      })
      .click();
    await expect(text).toContainText('Electron');
    await expect(text).toContainText('Chromium');
  }
  await page
    .getByRole('button', { name: 'Back to About', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Licenses', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await page.context().setOffline(false);
}
