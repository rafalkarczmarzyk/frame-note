import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import ExifReader from 'exifreader';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('imports a JPG, resolves a caption and exports a full-size JPEG', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Choose JPG photo').setInputFiles(wildlifeFixture.path);
  await page
    .getByLabel('Caption', { exact: true })
    .fill('{exif:Artist}\nFrameNote test');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JPG', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('20260520-IMG_3843-framenote.jpg');
  const path = await download.path();
  if (!path) throw new Error('Missing downloaded file');
  const bytes = await readFile(path);
  const tags = ExifReader.load(bytes);
  expect(tags['Image Width']?.value).toBe(wildlifeFixture.dimensions.width);
  expect(tags['Image Height']?.value).toBe(wildlifeFixture.dimensions.height);
  expect(bytes[0]).toBe(255);
  expect(bytes[1]).toBe(216);
  // Compare caption pixels to the same decoded source, not the mutable UI layout.
  const original = (await readFile(wildlifeFixture.path)).toString('base64');
  const output = bytes.toString('base64');
  const changes = await page.evaluate(
    async ({ original, output }) => {
      async function region(data: string) {
        const image = new Image();
        image.src = 'data:image/jpeg;base64,' + data;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 700;
        canvas.height = 160;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 100, 3750, 700, 160, 0, 0, 700, 160);
        return context.getImageData(0, 0, 700, 160).data;
      }
      const a = await region(original),
        b = await region(output);
      let count = 0;
      for (let i = 0; i < a.length; i += 4)
        if (
          (b[i] ?? 0) > 220 &&
          (b[i + 1] ?? 0) > 220 &&
          (b[i + 2] ?? 0) > 220 &&
          (a[i] ?? 0) < 150
        )
          count++;
      return count;
    },
    { original, output },
  );
  expect(changes).toBeGreaterThan(100);
});
