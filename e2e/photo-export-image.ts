import { readFile } from 'node:fs/promises';
import { expect, type Page, type TestInfo } from '@playwright/test';

export interface ExportDimensions {
  width: number;
  height: number;
}

/** Compare every decoded output pixel with the saved JPG for this browser project. */
export async function comparePhotoExport(
  page: Page,
  testInfo: TestInfo,
  name: string,
  actualJpeg: Buffer,
  expectedDimensions: ExportDimensions,
) {
  const baselinePath = testInfo.snapshotPath(`${name}.jpg`);
  if (
    testInfo.config.updateSnapshots === 'all' ||
    testInfo.config.updateSnapshots === 'changed' ||
    testInfo.config.updateSnapshots === 'missing'
  ) {
    const { mkdir, writeFile } = await import('node:fs/promises');
    await mkdir(testInfo.snapshotDir, { recursive: true });
    await writeFile(baselinePath, actualJpeg);
  }

  let expectedJpeg: Buffer;
  try {
    expectedJpeg = await readFile(baselinePath);
  } catch {
    await testInfo.attach(`${name}-candidate.jpg`, {
      body: actualJpeg,
      contentType: 'image/jpeg',
    });
    throw new Error(
      `Missing Photo export baseline: ${baselinePath}. Review the attached candidate before creating it with --update-snapshots.`,
    );
  }

  const comparison = await page.evaluate(
    async ({ expected, actual }) => {
      const decode = async (bytes: string) => {
        const image = new Image();
        image.src = `data:image/jpeg;base64,${bytes}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { colorSpace: 'srgb' })!;
        context.drawImage(image, 0, 0);
        return {
          canvas,
          pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
        };
      };
      const [before, after] = await Promise.all([
        decode(expected),
        decode(actual),
      ]);
      const sameDimensions =
        before.canvas.width === after.canvas.width &&
        before.canvas.height === after.canvas.height;
      let differingPixels = 0;
      let maxChannelDifference = 0;
      let firstDifference: {
        x: number;
        y: number;
        expected: number[];
        actual: number[];
      } | null = null;
      const diff = document.createElement('canvas');
      diff.width = Math.max(before.canvas.width, after.canvas.width);
      diff.height = Math.max(before.canvas.height, after.canvas.height);
      const diffContext = diff.getContext('2d')!;
      const diffPixels = diffContext.createImageData(diff.width, diff.height);

      if (sameDimensions) {
        for (let pixel = 0; pixel < before.pixels.length / 4; pixel++) {
          const offset = pixel * 4;
          const channels = [0, 1, 2].map((channel) => ({
            expected: before.pixels[offset + channel]!,
            actual: after.pixels[offset + channel]!,
          }));
          const difference = Math.max(
            ...channels.map(({ expected, actual }) =>
              Math.abs(expected - actual),
            ),
          );
          if (difference === 0) continue;
          differingPixels++;
          maxChannelDifference = Math.max(maxChannelDifference, difference);
          if (!firstDifference) {
            firstDifference = {
              x: pixel % before.canvas.width,
              y: Math.floor(pixel / before.canvas.width),
              expected: channels.map(({ expected }) => expected),
              actual: channels.map(({ actual }) => actual),
            };
          }
          const x = pixel % before.canvas.width;
          const y = Math.floor(pixel / before.canvas.width);
          const diffOffset = (y * diff.width + x) * 4;
          diffPixels.data[diffOffset] = 255;
          diffPixels.data[diffOffset + 1] = 0;
          diffPixels.data[diffOffset + 2] = 255;
          diffPixels.data[diffOffset + 3] = 255;
        }
      }
      diffContext.putImageData(diffPixels, 0, 0);
      return {
        expectedWidth: before.canvas.width,
        expectedHeight: before.canvas.height,
        width: after.canvas.width,
        height: after.canvas.height,
        sameDimensions,
        differingPixels,
        maxChannelDifference,
        firstDifference,
        diffPng: diff.toDataURL('image/png').split(',')[1]!,
      };
    },
    {
      expected: expectedJpeg.toString('base64'),
      actual: actualJpeg.toString('base64'),
      expectedDimensions,
    },
  );

  if (!comparison.sameDimensions || comparison.differingPixels > 0) {
    await testInfo.attach(`${name}-expected.jpg`, {
      body: expectedJpeg,
      contentType: 'image/jpeg',
    });
    await testInfo.attach(`${name}-actual.jpg`, {
      body: actualJpeg,
      contentType: 'image/jpeg',
    });
    await testInfo.attach(`${name}-diff.png`, {
      body: Buffer.from(comparison.diffPng, 'base64'),
      contentType: 'image/png',
    });
  }

  expect(
    {
      expectedWidth: comparison.expectedWidth,
      expectedHeight: comparison.expectedHeight,
      outputMatchesFixtureDimensions:
        comparison.width === expectedDimensions.width &&
        comparison.height === expectedDimensions.height,
      width: comparison.width,
      height: comparison.height,
      sameDimensions: comparison.sameDimensions,
      differingPixels: comparison.differingPixels,
      maxChannelDifference: comparison.maxChannelDifference,
      firstDifference: comparison.firstDifference,
    },
    'The decoded Photo export must match the approved full-image JPG baseline pixel for pixel.',
  ).toEqual({
    expectedWidth: comparison.width,
    expectedHeight: comparison.height,
    sameDimensions: true,
    outputMatchesFixtureDimensions: true,
    width: comparison.width,
    height: comparison.height,
    differingPixels: 0,
    maxChannelDifference: 0,
    firstDifference: null,
  });
}
