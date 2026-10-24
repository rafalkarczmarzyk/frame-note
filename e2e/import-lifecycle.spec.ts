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

test('keeps caption settings when replacing landscape and portrait photos', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByLabel('Choose JPG photo');
  await input.setInputFiles(wildlifeFixture.path);
  await page
    .getByLabel('Caption', { exact: true })
    .fill('My caption\n{exif:Artist}');
  await page.getByRole('button', { name: 'Font', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Choose a font' })
    .getByRole('button', { name: /Advercase/ })
    .click();
  await page.getByRole('button', { name: 'Close choose a font' }).click();
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('4.5');
  await page
    .getByRole('spinbutton', { name: 'Line spacing', exact: true })
    .fill('1.8');
  await page
    .getByRole('spinbutton', { name: 'Opacity value', exact: true })
    .fill('65');
  await page.getByRole('button', { name: 'Color', exact: true }).click();
  const colors = page.getByRole('dialog', { name: 'Choose a color' });
  await colors.getByRole('textbox', { name: 'Custom color (HEX)' }).fill('bcd');
  await colors.getByRole('button', { name: 'Apply color' }).click();
  await colors.getByRole('button', { name: 'Close choose a color' }).click();
  await page.getByRole('button', { name: 'top-right', exact: true }).click();
  await page
    .getByRole('radiogroup', { name: 'Text align' })
    .getByRole('radio', { name: 'Align right' })
    .click();
  await page
    .getByRole('radiogroup', { name: 'Margin linking' })
    .getByRole('radio', { name: 'Pairs', exact: true })
    .click();
  await page.getByRole('spinbutton', { name: 'Top', exact: true }).fill('5');
  await page.getByRole('spinbutton', { name: 'Left', exact: true }).fill('7');
  await page.getByRole('radio', { name: 'Balanced', exact: true }).click();
  for (const fixture of [portraitFixture, wildlifeFixture]) {
    await input.setInputFiles(fixture.path);
    await expect(
      page.getByRole('img', {
        name: `Photo preview: ${fixture.path.split('/').at(-1)}`,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Export JPG', exact: true }),
    ).toBeEnabled();
    await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
      'data-template',
      'My caption\n{exif:Artist}',
    );
    await expect(
      page.getByRole('button', { name: 'Font', exact: true }),
    ).toContainText('Advercase');
    await expect(
      page.getByRole('button', { name: 'Color', exact: true }),
    ).toContainText('#BBCCDD');
    await expect(
      page.getByRole('combobox', { name: 'Sizing unit', exact: true }),
    ).toContainText('% of short edge');
    for (const [name, value] of [
      ['Font size', '4.5'],
      ['Line spacing', '1.8'],
      ['Opacity value', '65'],
      ['Top', '5'],
      ['Bottom', '5'],
      ['Left', '7'],
      ['Right', '7'],
    ]) {
      await expect(
        page.getByRole('spinbutton', { name, exact: true }),
      ).toHaveValue(value!);
    }
    await expect(
      page.getByRole('button', { name: 'top-right', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('radio', { name: 'Align right', exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole('radio', { name: 'Pairs', exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole('radio', { name: 'Balanced', exact: true }),
    ).toBeChecked();
  }
});
