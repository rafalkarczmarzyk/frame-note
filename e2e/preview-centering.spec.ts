import { expect, test } from '@playwright/test';

test('centers the complete preview when the roll appears, photos switch and the workspace resizes', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByLabel('Choose JPG or PNG photo');
  const photo = async (name: string, width: number, height: number) => ({
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      await page.evaluate(
        ({ width, height }) => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d')!;
          context.fillStyle = '#506070';
          context.fillRect(0, 0, width, height);
          return canvas.toDataURL('image/png').split(',')[1]!;
        },
        { width, height },
      ),
      'base64',
    ),
  });
  const centered = async () => {
    await expect
      .poll(async () => {
        const canvas = page.locator('[data-photo-canvas] canvas').first();
        if (!(await canvas.count())) return false;
        return canvas.evaluate((element) => {
          if (!(element instanceof HTMLCanvasElement)) return false;
          const context = element.getContext('2d')!;
          const { width, height } = element;
          const pixels = context.getImageData(0, 0, width, height).data;
          let left = width,
            right = -1,
            top = height,
            bottom = -1;
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              if (pixels[(y * width + x) * 4 + 3]! > 0) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
              }
            }
          }
          return (
            right >= left &&
            Math.abs(left - (width - right - 1)) <= 2 &&
            Math.abs(top - (height - bottom - 1)) <= 2
          );
        });
      })
      .toBe(true);
  };
  await input.setInputFiles(await photo('landscape.png', 600, 400));
  await centered();
  await input.setInputFiles(await photo('portrait.png', 400, 600));
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  await expect(roll).toBeVisible();
  await centered();
  await roll.getByRole('button', { name: /landscape/ }).click();
  await centered();
  await page.setViewportSize({ width: 1100, height: 900 });
  await centered();
  await page
    .getByRole('button', { name: 'Photo actions', exact: true })
    .click();
  await page
    .getByRole('menuitem', { name: 'Close photo', exact: true })
    .click();
  await expect(roll).toHaveCount(0);
  await centered();
});
