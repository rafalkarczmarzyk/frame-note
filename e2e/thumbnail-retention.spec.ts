import { expect, test } from '@playwright/test';

test('retains every film thumbnail while rapid imports commit newer session items', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const revoke = URL.revokeObjectURL;
    const revoked: string[] = [];
    Object.assign(window, { thumbnailRevocations: revoked });
    URL.revokeObjectURL = (url: string) => {
      revoked.push(url);
      revoke.call(URL, url);
    };
  });
  await page.goto('/');
  const buffer = Buffer.from(
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 80;
      canvas.getContext('2d')!.fillRect(0, 0, 120, 80);
      return canvas.toDataURL('image/png').split(',')[1]!;
    }),
    'base64',
  );
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles(
    Array.from({ length: 24 }, (_, i) => ({
      name: `thumbnail-${i}.png`,
      mimeType: 'image/png',
      buffer,
    })),
  );
  const roll = page.getByRole('region', { name: 'Photo film roll' });
  await expect(roll.locator('img')).toHaveCount(24);
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
  const inspect = () =>
    roll.evaluate((element) => {
      const revoked = (window as unknown as { thumbnailRevocations: string[] })
        .thumbnailRevocations;
      return [...element.querySelectorAll('img')]
        .filter(
          (image) =>
            !image.complete ||
            image.naturalWidth === 0 ||
            revoked.includes(image.src),
        )
        .map((image) => image.src);
    });
  await expect.poll(inspect).toEqual([]);
  for (const index of [23, 0, 12]) {
    await roll
      .getByRole('button', { name: /thumbnail-/ })
      .nth(index)
      .click();
    await expect(
      page.getByRole('button', { name: 'Export JPG', exact: true }),
    ).toBeEnabled();
    expect(await inspect()).toEqual([]);
  }
});
