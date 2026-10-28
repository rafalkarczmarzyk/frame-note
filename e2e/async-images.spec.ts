import { expect, test, type Page } from '@playwright/test';
async function openPhoto(page: Page) {
  await page.goto('/');
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(data, 'base64'),
  });
}
test('cancels delayed insertion after content changes or the target layer disappears', async ({
  page,
}) => {
  await openPhoto(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const caption = page.getByLabel('Caption', { exact: true });
  await caption.fill('Original text');
  await page.evaluate(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      document.body.dataset.importPending = 'yes';
      await new Promise<void>((resolve) =>
        window.addEventListener('release-import', () => resolve(), {
          once: true,
        }),
      );
      return original.call(this);
    };
  });
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/rt.png');
  await expect(page.locator('body')).toHaveAttribute(
    'data-import-pending',
    'yes',
  );
  await caption.fill('Keep this edited text');
  await page.evaluate(() => window.dispatchEvent(new Event('release-import')));
  await expect(page.getByRole('alert')).toContainText('Content changed');
  await expect(caption).toHaveAttribute(
    'data-template',
    'Keep this edited text',
  );
  await expect(
    page.getByRole('img', { name: 'rt.png', exact: true }),
  ).toHaveCount(0);
  await page.evaluate(() => delete document.body.dataset.importPending);
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/rt.png');
  await expect(page.locator('body')).toHaveAttribute(
    'data-import-pending',
    'yes',
  );
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('release-import')));
  await expect(caption).toHaveAttribute('data-template', '');
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});
test('rejects a PNG with only a valid header and pastes portable text', async ({
  page,
}) => {
  await openPhoto(page);
  await page.getByLabel('Caption', { exact: true }).press('ControlOrMeta+a');
  await page.getByLabel('Caption', { exact: true }).press('Backspace');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '',
  );
  await page.evaluate(() => {
    const bytes = new Uint8Array(33);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
    new DataView(bytes.buffer).setUint32(16, 1);
    new DataView(bytes.buffer).setUint32(20, 1);
    const source =
      'data:image/png;base64,' + btoa(String.fromCharCode(...bytes));
    const data = new DataTransfer();
    data.setData('text/plain', 'Portable fallback');
    data.setData(
      'application/x-framenote-content',
      JSON.stringify({
        images: [
          {
            id: 'broken',
            name: 'Broken.png',
            format: 'png',
            source,
            width: 1,
            height: 1,
          },
        ],
        content: {
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'captionToken',
                  attrs: { token: 'image:broken:2:font:original' },
                },
              ],
            },
          ],
          openStart: 1,
          openEnd: 1,
        },
      }),
    );
    document.querySelector('[aria-label="Caption"]')!.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(page.getByRole('alert')).toContainText('Portable text');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'Portable fallback',
  );
  await expect(
    page.getByRole('button', { name: 'Export JPG', exact: true }),
  ).toBeEnabled();
});

test('a broken visible asset blocks export until its layer is hidden', async ({
  page,
}) => {
  await openPhoto(page);
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page.getByLabel('Preset name', { exact: true }).fill('Recovery');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.evaluate(() => {
    const key = 'framenote.presets.v1';
    const presets = JSON.parse(localStorage.getItem(key)!);
    const preset = presets[0];
    const healthy = preset.layout.containers[0];
    healthy.template = 'Healthy layer';
    const bytes = new Uint8Array(33);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
    new DataView(bytes.buffer).setUint32(16, 1);
    new DataView(bytes.buffer).setUint32(20, 1);
    const image = {
      id: 'broken',
      name: 'Broken.png',
      format: 'png',
      source: 'data:image/png;base64,' + btoa(String.fromCharCode(...bytes)),
      width: 1,
      height: 1,
    };
    preset.layout.containers.push({
      ...healthy,
      id: 'broken-layer',
      template: '{image:broken:2:font:original}',
      images: [image],
    });
    localStorage.setItem(key, JSON.stringify(presets));
  });
  await openPhoto(page);
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page.getByRole('option', { name: 'Recovery', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Broken.png');
  const exportButton = page.getByRole('button', {
    name: 'Export JPG',
    exact: true,
  });
  await expect(exportButton).toBeDisabled();
  await page.getByRole('button', { name: 'Hide layer 1', exact: true }).click();
  await expect(exportButton).toBeEnabled();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('reports cancellation when an image being replaced is removed during decoding', async ({
  page,
}) => {
  await openPhoto(page);
  const caption = page.getByLabel('Caption', { exact: true });
  await caption.press('ControlOrMeta+a');
  await caption.press('Backspace');
  await expect(caption).toHaveAttribute('data-template', '');
  await page
    .getByLabel('Upload image', { exact: true })
    .setInputFiles('tests/fixtures/logos/rt.png');
  const image = page.getByRole('img', { name: 'rt.png', exact: true });
  await image.click();
  await page.evaluate(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      document.body.dataset.importPending = 'yes';
      await new Promise<void>((resolve) =>
        window.addEventListener('release-import', () => resolve(), {
          once: true,
        }),
      );
      return original.call(this);
    };
  });
  const pending = page.waitForEvent('filechooser');
  await page
    .getByRole('button', { name: 'Replace image', exact: true })
    .click();
  await (await pending).setFiles('tests/fixtures/logos/rt.png');
  await expect(page.locator('body')).toHaveAttribute(
    'data-import-pending',
    'yes',
  );
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('release-import')));
  await expect(page.getByRole('alert')).toContainText('Content changed');
  await expect(image).toHaveCount(0);
  await expect(caption).toHaveAttribute('data-template', '');
});
