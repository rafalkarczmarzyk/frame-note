import { openSidebarSection } from './sidebar-helpers.js';
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import ExifReader from 'exifreader';
import { wildlifeFixture } from '../tests/fixtures.js';

test('metadata choices affect the prepared download and retain the original pixels', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  const download = async () => {
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    const path = await (await pending).path();
    const bytes = await readFile(path!);
    await expect(page.getByTestId('output-size')).toHaveAttribute(
      'data-bytes',
      String(bytes.length),
    );
    return bytes;
  };
  await openSidebarSection(page, 'Export');
  const remove = page.getByRole('switch', {
    name: 'Remove all metadata',
    exact: true,
  });
  await expect(remove).toBeChecked();
  const clean = await download();
  expect(
    ExifReader.load(clean, { expanded: true }).xmp?.creator,
  ).toBeUndefined();
  await remove.click();
  await expect(
    page.getByRole('switch', { name: 'Author & copyright', exact: true }),
  ).toBeChecked();
  let kept = await download();
  let tags = ExifReader.load(kept, { expanded: true });
  expect(tags.xmp?.creator?.description).toContain(
    wildlifeFixture.expectedExif.Artist,
  );
  expect(tags.xmp?.Model).toBeUndefined();
  await page
    .getByRole('switch', { name: 'Camera & exposure', exact: true })
    .click();
  kept = await download();
  tags = ExifReader.load(kept, { expanded: true });
  expect(tags.xmp?.Model).toBeDefined();
  // Removing only the inserted XMP segment must recover the identical encoded JPG.
  const marker =
    kept.indexOf(Buffer.from('http://ns.adobe.com/xap/1.0/\0')) - 4;
  const length = kept.readUInt16BE(marker + 2);
  expect(
    Buffer.concat([
      kept.subarray(0, marker),
      kept.subarray(marker + 2 + length),
    ]),
  ).toEqual(clean);
  await remove.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('export-options.png') });
  await remove.click();
  expect(await download()).toEqual(clean);
});
