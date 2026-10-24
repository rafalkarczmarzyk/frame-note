import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import ExifReader from 'exifreader';
import { portraitFixture, wildlifeFixture } from '../tests/fixtures.ts';

// Baselines describe exported image pixels, independent of the sidebar layout.
// Playwright includes the platform/project in snapshot paths. Never update them
// as part of a routine test run: inspect candidate images first.
test('exports landscape and portrait JPGs with stable caption pixels and colors', async ({
  page,
}, testInfo) => {
  for (const [name, fixture] of [
    ['landscape', wildlifeFixture],
    ['portrait', portraitFixture],
  ] as const) {
    await test.step(name, async () => {
      await page.goto('/');
      await page.getByLabel('Choose JPG photo').setInputFiles(fixture.path);
      await page
        .getByLabel('Caption', { exact: true })
        .fill('{exif:Artist}\nFrameNote test');
      await expect(
        page.getByRole('button', { name: 'Export JPG', exact: true }),
      ).toBeEnabled();
      // Changing the shared unit must preserve the exported geometry.
      for (const unit of ['% of long edge', 'Pixels (px)', '% of short edge']) {
        await page
          .getByRole('combobox', { name: 'Sizing unit', exact: true })
          .click();
        await page.getByRole('option', { name: unit, exact: true }).click();
      }
      await expect(
        page.getByRole('spinbutton', { name: 'Font size', exact: true }),
      ).toHaveValue('2');
      // Keep the rendering baseline independent of the default font size.
      await page
        .getByRole('spinbutton', { name: 'Font size', exact: true })
        .fill('1.35');
      await page
        .getByRole('slider', { name: 'Opacity', exact: true })
        .press('Home');
      await expect(
        page.getByRole('spinbutton', { name: 'Opacity value', exact: true }),
      ).toHaveValue('0');
      await page
        .getByRole('spinbutton', { name: 'Opacity value', exact: true })
        .fill('100');
      await page
        .getByRole('spinbutton', { name: 'Right', exact: true })
        .fill('4');
      await expect(
        page.getByRole('spinbutton', { name: 'Top', exact: true }),
      ).toHaveValue('3');
      await page
        .getByRole('radiogroup', { name: 'Margin linking' })
        .getByRole('radio', { name: 'All', exact: true })
        .click();
      await expect(
        page.getByRole('spinbutton', { name: 'Right', exact: true }),
      ).toHaveValue('3');
      await page
        .getByRole('radiogroup', { name: 'Margin linking' })
        .getByRole('radio', { name: 'None', exact: true })
        .click();
      await expect(
        page.getByRole('button', { name: 'Export JPG', exact: true }),
      ).toBeEnabled();
      const preparedBytes = Number(
        await page.getByTestId('output-size').getAttribute('data-bytes'),
      );
      const downloadPromise = page.waitForEvent('download');
      await page
        .getByRole('button', { name: 'Export JPG', exact: true })
        .click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(
        fixture.path.split('/').at(-1)!.replace('.jpg', '-framenote.jpg'),
      );
      const path = await download.path();
      if (!path) throw new Error('Missing downloaded file');
      const bytes = await readFile(path);
      expect(bytes.length).toBe(preparedBytes);
      const tags = ExifReader.load(bytes);
      expect(tags['Image Width']?.value).toBe(fixture.dimensions.width);
      expect(tags['Image Height']?.value).toBe(fixture.dimensions.height);
      for (const removed of [
        'Artist',
        'Orientation',
        'GPSLatitude',
        'GPSLongitude',
        'UserComment',
        'ProfileDescription',
      ]) {
        expect(tags[removed]).toBeUndefined();
      }
      expect(bytes.subarray(0, 2).toString('hex')).toBe('ffd8');
      const original = (await readFile(fixture.path)).toString('base64');
      const result = await page.evaluate(
        async ({ original, output }) => {
          async function decode(data: string) {
            const image = new Image();
            image.src = 'data:image/jpeg;base64,' + data;
            await image.decode();
            return image;
          }
          const source = await decode(original),
            image = await decode(output);
          function canvas(width: number, height: number) {
            const element = document.createElement('canvas');
            element.width = width;
            element.height = height;
            const context = element.getContext('2d', { colorSpace: 'srgb' })!;
            return { element, context };
          }
          const thumb = canvas(
            Math.round((image.width / image.height) * 480),
            480,
          );
          thumb.context.drawImage(image, 0, 0, thumb.element.width, 480);
          const detail = canvas(1400, 300);
          detail.context.drawImage(
            image,
            0,
            image.height - 300,
            1400,
            300,
            0,
            0,
            1400,
            300,
          );
          // An unaffected top region detects color shifts or an accidental rotation.
          const before = canvas(256, 256),
            after = canvas(256, 256);
          before.context.drawImage(
            source,
            0,
            0,
            source.width,
            source.height * 0.5,
            0,
            0,
            256,
            256,
          );
          after.context.drawImage(
            image,
            0,
            0,
            image.width,
            image.height * 0.5,
            0,
            0,
            256,
            256,
          );
          const a = before.context.getImageData(0, 0, 256, 256).data,
            b = after.context.getImageData(0, 0, 256, 256).data;
          let error = 0;
          for (let i = 0; i < a.length; i++)
            if (i % 4 !== 3) error += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
          return {
            thumbnail: thumb.element.toDataURL('image/png').split(',')[1]!,
            caption: detail.element.toDataURL('image/png').split(',')[1]!,
            meanColorError: error / (256 * 256 * 3),
          };
        },
        { original, output: bytes.toString('base64') },
      );
      expect(result.meanColorError).toBeLessThan(3);
      if (testInfo.project.name === 'chromium') {
        expect(Buffer.from(result.thumbnail, 'base64')).toMatchSnapshot(
          `${name}-export.png`,
          { threshold: 0.1, maxDiffPixelRatio: 0.001 },
        );
        expect(Buffer.from(result.caption, 'base64')).toMatchSnapshot(
          `${name}-caption.png`,
          { threshold: 0.1, maxDiffPixelRatio: 0.001 },
        );
      }
      if (name === 'landscape') {
        await page
          .getByRole('slider', { name: 'JPEG quality', exact: true })
          .press('Home');
        const smallerDownload = page.waitForEvent('download');
        await page
          .getByRole('button', { name: 'Export JPG', exact: true })
          .click();
        const smallerPath = await (await smallerDownload).path();
        if (!smallerPath) throw new Error('Missing low quality export');
        expect((await readFile(smallerPath)).length).toBeLessThan(bytes.length);
      }
    });
  }

  await test.step('bakes EXIF rotation into the exported pixels', async () => {
    await page.goto('/');
    const source = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 80;
      const context = canvas.getContext('2d')!;
      const styles = getComputedStyle(document.documentElement);
      context.fillStyle = styles
        .getPropertyValue('--color-tropical-mint')
        .trim();
      context.fillRect(0, 0, 60, 80);
      const mint = Array.from(context.getImageData(30, 40, 1, 1).data).slice(
        0,
        3,
      );
      context.fillStyle = styles.getPropertyValue('--color-charcoal').trim();
      context.fillRect(60, 0, 60, 80);
      const charcoal = Array.from(
        context.getImageData(90, 40, 1, 1).data,
      ).slice(0, 3);
      return {
        data: canvas.toDataURL('image/jpeg', 1).split(',')[1]!,
        mint,
        charcoal,
      };
    });
    const jpeg = Buffer.from(source.data, 'base64');
    // Minimal EXIF IFD: Orientation = 6 (90 degrees clockwise).
    const orientation = Buffer.from([
      255, 225, 0, 34, 69, 120, 105, 102, 0, 0, 73, 73, 42, 0, 8, 0, 0, 0, 1, 0,
      18, 1, 3, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
    ]);
    await page.getByLabel('Choose JPG photo').setInputFiles({
      name: 'rotated.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.concat([
        jpeg.subarray(0, 2),
        orientation,
        jpeg.subarray(2),
      ]),
    });
    await page.getByLabel('Caption', { exact: true }).fill('');
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JPG', exact: true }).click();
    const path = await (await pending).path();
    if (!path) throw new Error('Missing rotated export');
    const bytes = await readFile(path),
      tags = ExifReader.load(bytes);
    expect(tags['Image Width']?.value).toBe(80);
    expect(tags['Image Height']?.value).toBe(120);
    expect(tags.Orientation).toBeUndefined();
    const pixels = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = 'data:image/jpeg;base64,' + data;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return {
        top: Array.from(context.getImageData(40, 30, 1, 1).data).slice(0, 3),
        bottom: Array.from(context.getImageData(40, 90, 1, 1).data).slice(0, 3),
      };
    }, bytes.toString('base64'));
    for (let channel = 0; channel < 3; channel++) {
      expect(
        Math.abs((pixels.top[channel] ?? 0) - (source.mint[channel] ?? 0)),
      ).toBeLessThan(5);
      expect(
        Math.abs(
          (pixels.bottom[channel] ?? 0) - (source.charcoal[channel] ?? 0),
        ),
      ).toBeLessThan(5);
    }
  });
});
