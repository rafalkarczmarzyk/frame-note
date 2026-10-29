import { test, expect } from '@playwright/test';
import { openPhoto, ready, shot, section } from './helpers.js';
import { replaceCaption } from '../../e2e/caption-helpers.js';
for (const type of ['None', 'Color', 'Glass']) {
  test(`UI-17 / background / ${type}`, async ({ page }) => {
    await openPhoto(page);
    await page
      .getByRole('radiogroup', { name: 'Background type', exact: true })
      .getByRole('radio', { name: type, exact: true })
      .click();
    const region = page.getByRole('region', {
      name: 'Background',
      exact: true,
    });
    await region.scrollIntoViewIfNeeded();
    if (type === 'Color')
      await region
        .getByRole('switch', { name: 'Drop shadow', exact: true })
        .click();
    await ready(page);
    await shot(page, 'background');
    await expect(region).toHaveScreenshot('controls.png');
  });
}
test('UI-06 / sidebar / expanded', async ({ page }) => {
  await openPhoto(page);
  for (const key of ['photo', 'sizing', 'export']) {
    await section(page, key);
    await shot(page, key);
  }
});
test('UI-16 / content / whitespace', async ({ page }) => {
  await openPhoto(page);
  await replaceCaption(
    page,
    'A  B\n{author}\n\nLong line of content with spaces and formatting marks',
  );
  const button = page.getByRole('button', {
    name: 'Show formatting marks',
    exact: true,
  });
  await shot(page, 'marks-on');
  await button.click();
  await shot(page, 'marks-off');
});
for (const token of ['author', 'exif:DefinitelyUnknown', 'heliconStack']) {
  test(`UI-13 / metadata / ${token}`, async ({ page }) => {
    await openPhoto(page);
    await replaceCaption(page, `{${token}}`);
    await page
      .getByRole('textbox', { name: 'Caption', exact: true })
      .locator('[data-token]')
      .first()
      .click();
    await expect(
      page.getByLabel('Selected element settings', { exact: true }),
    ).toBeVisible();
    await shot(page, 'metadata');
  });
}
test('UI-21 / units / conversion', async ({ page }) => {
  await openPhoto(page);
  await section(page, 'sizing');
  for (const name of ['Pixels (px)', '% of short edge', '% of long edge']) {
    await page
      .getByRole('combobox', { name: 'Sizing unit', exact: true })
      .click();
    const options = page.getByRole('option');
    const names = await options.allTextContents();
    const choice = names.find((n) =>
      name.startsWith('Pixels')
        ? n.includes('Pixels')
        : name.includes('short')
          ? n.toLowerCase().includes('short')
          : n.toLowerCase().includes('long'),
    )!;
    await page.getByRole('option', { name: choice, exact: true }).click();
    await ready(page);
    await shot(
      page,
      name.includes('Pixels')
        ? 'px'
        : name.includes('short')
          ? 'short'
          : 'long',
    );
  }
});
test('UI-27 / export / metadata', async ({ page }) => {
  await openPhoto(page);
  await section(page, 'export');
  await page
    .getByRole('switch', { name: 'Remove all metadata', exact: true })
    .click();
  await shot(page, 'metadata-groups');
});
test('UI-18 / backgrounds / overlapping-edge', async ({ page }) => {
  await openPhoto(page);
  await replaceCaption(page, 'Lower layer');
  await page.getByRole('radio', { name: 'Color', exact: true }).click();
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await replaceCaption(page, 'Glass above lower layer');
  await page.getByRole('radio', { name: 'Glass', exact: true }).click();
  await expect(page.locator('[data-glass-ready="true"]')).toBeVisible();
  await ready(page);
  const sizing = await section(page, 'sizing');
  for (const side of ['Left', 'Right', 'Top', 'Bottom'])
    await sizing.getByRole('spinbutton', { name: side, exact: true }).fill('0');
  await sizing
    .getByRole('spinbutton', { name: 'Bottom', exact: true })
    .press('Tab');
  await shot(page, 'overlap');
});
test('UI-20 / position / anchor-manual', async ({ page }) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'top-right', exact: true }).click();
  await ready(page);
  await shot(page, 'anchor');
  await page.getByRole('radio', { name: 'Manual', exact: true }).click();
  await page
    .getByRole('spinbutton', { name: 'X position', exact: true })
    .fill('25');
  await page
    .getByRole('spinbutton', { name: 'Y position', exact: true })
    .fill('75');
  await page
    .getByRole('spinbutton', { name: 'Y position', exact: true })
    .press('Tab');
  await ready(page);
  await shot(page, 'manual');
});
