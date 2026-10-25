import { expect, test } from '@playwright/test';

async function openEditor(page: import('@playwright/test').Page) {
  await page.goto('/');
  const photo = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 180;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'image-limit.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(photo, 'base64'),
  });
  const editor = page.getByLabel('Caption', { exact: true });
  await editor.press('ControlOrMeta+a');
  await editor.press('Backspace');
  await expect(editor).toHaveAttribute('data-template', '');
}

async function pasteImages(
  page: import('@playwright/test').Page,
  ids: string[],
) {
  await page.evaluate((assetIds) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const png = canvas.toDataURL('image/png');
    const images = assetIds.map((id) => ({
      id,
      name: `${id}.png`,
      format: 'png',
      source: png,
      width: 1,
      height: 1,
    }));
    const content = {
      content: [
        {
          type: 'paragraph',
          content: assetIds.map((id) => ({
            type: 'captionToken',
            attrs: { token: `image:${id}:2:font:original` },
          })),
        },
      ],
      openStart: 1,
      openEnd: 1,
    };
    const data = new DataTransfer();
    data.setData(
      'text/plain',
      assetIds.map((id) => `{image:${id}:2:font:original}`).join(' '),
    );
    data.setData(
      'application/x-framenote-content',
      JSON.stringify({ content, images }),
    );
    document.querySelector('[aria-label="Caption"]')!.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, ids);
}

test('enforces the 100 image limit for plain paste and preserves the valid preset boundary', async ({
  page,
}) => {
  await openEditor(page);
  const firstIds = Array.from({ length: 100 }, (_, index) => `image-${index}`);
  await pasteImages(page, firstIds);
  const editor = page.getByLabel('Caption', { exact: true });
  const expected100 = firstIds
    .map((id) => `{image:${id}:2:font:original}`)
    .join('');
  await expect(editor).toHaveAttribute('data-template', expected100);

  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page
    .getByLabel('Preset name', { exact: true })
    .fill('One hundred images');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.reload();
  const photo = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 180;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'image-limit.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(photo, 'base64'),
  });
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page
    .getByRole('option', { name: 'One hundred images', exact: true })
    .click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    expected100,
  );

  // Removing the tokens keeps their image data in the editor's undo history.
  const reloadedEditor = page.getByLabel('Caption', { exact: true });
  await reloadedEditor.press('ControlOrMeta+a');
  await reloadedEditor.press('Backspace');
  await expect(reloadedEditor).toHaveAttribute('data-template', '');
  await pasteImages(page, ['new-image']);
  const newToken = '{image:new-image:2:font:original}';
  await expect(reloadedEditor).toHaveAttribute('data-template', newToken);

  await reloadedEditor.press('End');
  await page.evaluate((text) => {
    const data = new DataTransfer();
    data.setData('text/plain', text);
    document.querySelector('[aria-label="Caption"]')!.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, expected100);
  await expect(page.getByRole('alert')).toContainText('100 active images');
  await expect(reloadedEditor).toHaveAttribute('data-template', newToken);
});
