import { expect, test } from '@playwright/test';
import { xmpPortraitFixture, wildlifeFixture } from '../tests/fixtures.ts';

test('shows helpers first, keeps original namespaces and resolves a portable template', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByLabel('Choose JPG or PNG photo');
  await input.setInputFiles(xmpPortraitFixture.path);
  const caption = page.getByLabel('Caption', { exact: true });
  await expect(caption).toHaveAttribute(
    'data-template',
    '{author}\n{lens}\n{exposure}',
  );
  await page.getByRole('button', { name: 'Browse available tags' }).click();
  const panel = page.getByRole('dialog', { name: 'Available tags' });
  await expect(panel.locator('h3').first()).toHaveText('FrameNote');
  await expect(
    panel
      .getByRole('region', { name: 'FrameNote', exact: true })
      .getByRole('button', { name: /^author\b/ }),
  ).toContainText('PAULINA PECZEK');
  await expect(panel.getByRole('button', { name: /^author\b/ })).toContainText(
    'Source: xmp:dc:creator',
  );
  await expect(panel.getByRole('button', { name: /^iso\b/ })).toContainText(
    'No data in this photo.',
  );
  const search = panel.getByRole('textbox', { name: 'Search metadata' });
  await search.fill('xmp:creator');
  await expect(panel.locator('h3')).toHaveText(['XMP']);
  await expect(
    panel.getByRole('button', { name: /^xmp:creator\b/ }),
  ).toBeVisible();
  await panel.getByRole('button', { name: 'Close available tags' }).click();
  await caption.fill('{author}\n{lens}\n{date}');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
  await input.setInputFiles(wildlifeFixture.path);
  await expect(caption).toHaveAttribute(
    'data-template',
    '{author}\n{lens}\n{date}',
  );
  await page.getByRole('button', { name: 'Browse available tags' }).click();
  await search.fill('author');
  await expect(panel.locator('h3')).toHaveText(['FrameNote']);
  await expect(panel.getByRole('button', { name: /^author\b/ })).toContainText(
    'Rafal Karczmarzyk',
  );
  await search.fill('exif:Artist');
  await expect(panel.locator('h3')).toHaveText(['EXIF']);
  await expect(
    panel.getByRole('button', { name: /^exif:Artist\b/ }),
  ).toContainText('Rafal Karczmarzyk');
});
