import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('opens the Lightroom JPG and searches its real EXIF and XMP fields', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Choose JPG photo').setInputFiles(wildlifeFixture.path);
  await expect(
    page.getByRole('img', { name: 'Photo preview: 20260520-IMG_3843.jpg' }),
  ).toBeVisible();
  await expect(page.getByText('5964 × 3976 px')).toBeVisible();
  await expect
    .poll(async () =>
      page
        .locator('canvas')
        .first()
        .evaluate((canvas) => {
          if (!(canvas instanceof HTMLCanvasElement)) return 0;
          const context = canvas.getContext('2d');
          return context?.getImageData(
            Math.floor(canvas.width / 2),
            Math.floor(canvas.height / 2),
            1,
            1,
          ).data[3];
        }),
    )
    .toBe(255);

  await page.getByLabel('Search metadata').fill('LensModel');
  await expect(page.getByText('exif:LensModel', { exact: true })).toBeVisible();
  await expect(page.getByText('xmp:LensModel', { exact: true })).toBeVisible();
  await page.getByLabel('Search metadata').fill('Artist');
  await expect(
    page.getByText('Rafal Karczmarzyk', { exact: true }),
  ).toBeVisible();
});

test('rejects non-JPEG content without navigating away', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'fake.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('not a jpeg'),
  });
  await expect(page.getByRole('alert')).toHaveText(
    'Please choose a valid JPG photo.',
  );
  await expect(
    page.getByRole('heading', { name: 'Every frame has a story.' }),
  ).toBeVisible();
});

test('imports a dropped JPG and keeps it when a replacement is invalid', async ({
  page,
}) => {
  await page.goto('/');
  const { readFile } = await import('node:fs/promises');
  const bytes = (await readFile(wildlifeFixture.path)).toString('base64');
  await page.evaluate((data) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(
        [Uint8Array.from(atob(data), (character) => character.charCodeAt(0))],
        'dropped.jpg',
        { type: 'image/jpeg' },
      ),
    );
    window.dispatchEvent(
      new DragEvent('drop', { dataTransfer: transfer, cancelable: true }),
    );
  }, bytes);
  await expect(
    page.getByRole('img', { name: 'Photo preview: dropped.jpg' }),
  ).toBeVisible();
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'invalid.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('bad'),
  });
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Photo preview: dropped.jpg' }),
  ).toBeVisible();
});
