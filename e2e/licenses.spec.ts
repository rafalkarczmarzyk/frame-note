// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { expect, test } from '@playwright/test';

test('web header has an About button next to the logo', async ({ page }) => {
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(
    header.getByRole('button', { name: 'About FrameNote', exact: true }),
  ).toBeVisible();
  const about = header.getByRole('button', { name: 'About', exact: true });
  await expect(about).toBeVisible();
  await about.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByAltText('Blue tit perched on a garden fence'),
  ).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /^GitHub/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /^Changelog/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Close about FrameNote', exact: true }),
  ).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('About initially focuses its container without activating Close or its tooltip', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const opener = page.getByRole('button', {
    name: 'About FrameNote',
    exact: true,
  });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Leave your mark.' });
  const close = page.getByRole('button', {
    name: 'Close about FrameNote',
    exact: true,
  });
  await expect(dialog).toBeFocused();
  await expect(close).not.toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  // Safari on macOS uses Option+Tab to include buttons in tab navigation.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(close).toBeFocused();
  await expect(page.getByRole('tooltip')).toContainText(
    'Close About FrameNote',
  );
  await close.click();
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('About reads local licenses, preserves focus and reports missing files', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  const bounds = await page.getByRole('dialog').boundingBox();
  await page.getByRole('link', { name: 'Licenses', exact: true }).click();
  await expect
    .poll(() => page.getByRole('dialog').boundingBox())
    .toEqual(bounds);
  const text = page.getByLabel('Full licenses and notices');
  await expect(text).toContainText('GNU GENERAL PUBLIC LICENSE');
  await expect(text).toContainText(
    'These photographs are not licensed under the GNU GPL',
  );
  await expect(text).toContainText('SIL OPEN FONT LICENSE');
  await expect
    .poll(() => page.getByRole('dialog').boundingBox())
    .toEqual(bounds);
  await expect(
    page.getByRole('dialog', { name: 'Licenses and notices' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Back to About', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Licenses', exact: true }),
  ).toBeFocused();
  await expect
    .poll(() => page.getByRole('dialog').boundingBox())
    .toEqual(bounds);
  await page.route('**/legal/LICENSE.txt', (route) =>
    route.fulfill({ status: 404, body: 'missing' }),
  );
  await page.getByRole('link', { name: 'Licenses', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'License files could not be loaded',
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
