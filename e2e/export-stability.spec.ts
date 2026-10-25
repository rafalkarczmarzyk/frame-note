import { expect, test } from '@playwright/test';
test('selection and hover reuse the prepared JPG while content changes encode again', async ({
  page,
}) => {
  await page.goto('/');
  const data = await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    document.body.dataset.jpegEncodes = '0';
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      if (type === 'image/jpeg')
        document.body.dataset.jpegEncodes = String(
          Number(document.body.dataset.jpegEncodes) + 1,
        );
      return original.call(this, callback, type, quality);
    };
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(data, 'base64'),
  });
  await page.getByLabel('Caption', { exact: true }).fill('First layer');
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await page.getByLabel('Caption', { exact: true }).fill('Second layer');
  const ready = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(ready).toBeEnabled();
  const before = await page.locator('body').getAttribute('data-jpeg-encodes');
  await ready.evaluate((button) => {
    document.body.dataset.exportDisabled = 'no';
    new MutationObserver(() => {
      if ((button as HTMLButtonElement).disabled)
        document.body.dataset.exportDisabled = 'yes';
    }).observe(button, { attributes: true, attributeFilter: ['disabled'] });
  });
  await page.getByRole('button', { name: /^First layer/ }).click();
  await page.getByRole('button', { name: /^Second layer/ }).hover();
  await page.getByRole('button', { name: /^Second layer/ }).click();
  // Observe longer than the 450 ms export debounce, so an unnecessary job is detected.
  await page.waitForTimeout(800);
  await expect(page.locator('body')).toHaveAttribute(
    'data-jpeg-encodes',
    before!,
  );
  await expect(page.locator('body')).toHaveAttribute(
    'data-export-disabled',
    'no',
  );
  await page.getByLabel('Caption', { exact: true }).fill('Changed layer');
  await expect
    .poll(async () =>
      Number(await page.locator('body').getAttribute('data-jpeg-encodes')),
    )
    .toBeGreaterThan(Number(before));
  await expect(ready).toBeEnabled();
});
