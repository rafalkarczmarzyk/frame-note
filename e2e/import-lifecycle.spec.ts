import { expect, test } from '@playwright/test';
import { portraitFixture, wildlifeFixture } from '../tests/fixtures.ts';

test('recovers from invalid imports and keeps the latest photo during rapid replacement', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const liveUrls = new Set<string>();
    Object.assign(window, { testLivePhotoUrls: liveUrls });
    const createUrl = URL.createObjectURL.bind(URL);
    const revokeUrl = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = createUrl(blob);
      liveUrls.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      liveUrls.delete(url);
      revokeUrl(url);
    };
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return decode.call(this);
    };
  });
  await page.goto('/');
  const input = page.getByLabel('Choose JPG photo');
  await input.setInputFiles(wildlifeFixture.path);
  await input.setInputFiles(portraitFixture.path);
  await expect(
    page.getByRole('img', { name: 'Photo preview: 20261021-IMG_0469.jpg' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
  const liveUrlCount = () =>
    page.evaluate(
      () =>
        (window as unknown as { testLivePhotoUrls: Set<string> })
          .testLivePhotoUrls.size,
    );
  await expect.poll(liveUrlCount).toBe(1);
  await input.setInputFiles({
    name: 'broken.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('not a jpeg'),
  });
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Photo preview: 20261021-IMG_0469.jpg' }),
  ).toBeVisible();
  await input.setInputFiles({
    name: 'empty.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.alloc(0),
  });
  await expect(page.getByRole('alert')).toContainText('empty');
  await input.setInputFiles({
    name: 'corrupt.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
  });
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect.poll(liveUrlCount).toBe(1);
  // A SOF header declaring 10001 × 5000 pixels, with no image data.
  // The size error must come from the header check, before Image.decode().
  await input.setInputFiles({
    name: 'oversized.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from([
      0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, 0x13, 0x88, 0x27, 0x11, 3, 1, 0x11, 0,
      2, 0x11, 0, 3, 0x11, 0, 0xff, 0xd9,
    ]),
  });
  await expect(page.getByRole('alert')).toContainText('50 megapixels');
  await expect.poll(liveUrlCount).toBe(1);
  await input.setInputFiles(wildlifeFixture.path);
  await expect(
    page.getByRole('img', { name: 'Photo preview: 20260520-IMG_3843.jpg' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect.poll(liveUrlCount).toBe(1);
  expect(errors).toEqual([]);
});
