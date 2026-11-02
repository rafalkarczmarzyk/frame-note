import { expect, test, type Locator } from '@playwright/test';
test('panels receive keyboard focus and return it to their opener', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(bytes, 'base64'),
  });
  const dismiss = async (panel: Locator) => {
    for (let attempt = 0; attempt < 3 && (await panel.count()); attempt++)
      await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
  };
  const cases = [
    {
      trigger: page.getByRole('button', {
        name: 'Add content',
        exact: true,
      }),
      dialog: 'Add content',
    },
    {
      trigger: page.getByRole('button', { name: 'Font', exact: true }),
      dialog: 'Choose a font',
      input: 'Search fonts',
    },
    {
      trigger: page.getByRole('button', {
        name: 'Preset actions',
        exact: true,
      }),
      dialog: 'Manage presets',
    },
  ];
  for (const item of cases) {
    await item.trigger.focus();
    await item.trigger.press('Enter');
    if (item.dialog === 'Manage presets')
      await page
        .getByRole('menuitem', { name: 'Manage presets', exact: true })
        .click();
    const panel = page.getByRole('dialog', { name: item.dialog, exact: true });
    await expect(panel).toBeVisible();
    if (item.input)
      await expect(
        panel.getByRole('textbox', { name: item.input, exact: true }),
      ).toBeFocused();
    else
      await expect
        .poll(() =>
          panel.evaluate((node) => node.contains(document.activeElement)),
        )
        .toBe(true);
    await dismiss(panel);
    await expect(item.trigger).toBeFocused();
  }
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  const colors = page.getByRole('dialog', {
    name: 'Choose a color',
    exact: true,
  });
  await expect(
    colors.getByRole('button', { name: 'White', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Close choose a color', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Color', exact: true }),
  ).toBeFocused();
  // Switching content preserves the new panel's focus and new return target.
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await page.getByRole('button', { name: 'Add content', exact: true }).click();
  await expect(
    page
      .getByRole('dialog', { name: 'Add content', exact: true })
      .getByRole('group', { name: 'Content categories', exact: true }),
  ).toBeFocused();
  const contentPanel = page.getByRole('dialog', { name: 'Add content' });
  const metadata = contentPanel.getByRole('button', {
    name: 'Metadata',
    exact: true,
  });
  await expect(metadata).toHaveAttribute('aria-pressed', 'true');
  await expect(contentPanel.locator('button:focus-visible')).toHaveCount(0);
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(metadata).toBeFocused();
  await expect(metadata).toHaveCSS('outline-style', 'solid');
  await metadata.hover();
  // Wait beyond the tooltip delay to catch accidental Browse tooltips.
  await page.waitForTimeout(900);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(
    contentPanel.getByRole('button', { name: 'Icons', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    contentPanel.getByRole('button', { name: 'Icons', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await dismiss(page.getByRole('dialog', { name: 'Add content', exact: true }));
  await expect(
    page.getByRole('button', { name: 'Add content', exact: true }),
  ).toBeFocused();
  // Removing the layer also removes the original Font trigger.
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await page
    .getByRole('button', { name: 'Layer 1 actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Search fonts', exact: true })
    .press('Escape');
  await expect(page.getByLabel('Caption', { exact: true })).toBeFocused();
});
