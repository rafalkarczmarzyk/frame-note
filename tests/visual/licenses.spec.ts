// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { expect, test } from '@playwright/test';
import { shot } from './helpers.js';

test('About licensing footer', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  await shot(page, 'window');
});

test('offline license reader', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'About FrameNote', exact: true })
    .click();
  await page.getByRole('link', { name: 'Licenses', exact: true }).click();
  await expect(page.getByLabel('Full licenses and notices')).toContainText(
    'GNU GENERAL PUBLIC LICENSE',
  );
  await shot(page, 'window');
});
