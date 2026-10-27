import { expect, test, type Page } from '@playwright/test';
async function sendFile(
  page: Page,
  selector: string,
  type: string,
  file: { name: string; type: string; text?: string; base64?: string },
) {
  await page.evaluate(
    ({ selector, type, file }) => {
      const data = new DataTransfer();
      const bytes = file.base64
        ? Uint8Array.from(atob(file.base64), (char) => char.charCodeAt(0))
        : file.text!;
      data.items.add(new File([bytes], file.name, { type: file.type }));
      document.querySelector(selector)!.dispatchEvent(
        new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          dataTransfer: data,
        }),
      );
    },
    { selector, type, file },
  );
}
test('drops SVG and PNG at the retained cursor in Content without replacing the photo', async ({
  page,
}) => {
  await page.goto('/');
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    return canvas.toDataURL('image/png').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(bytes, 'base64'),
  });
  const caption = page.getByLabel('Caption', { exact: true });
  await caption.fill('BeforeAfter');
  for (let i = 0; i < 5; i++) await caption.press('ArrowLeft');
  const svg = {
    name: 'mark.svg',
    type: 'image/svg+xml',
    text: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
  };
  await sendFile(page, 'header', 'drop', svg);
  await expect(caption).toHaveAttribute('data-template', 'BeforeAfter');
  const content = 'section[aria-label="Content"]';
  await sendFile(page, content, 'dragenter', svg);
  await expect(page.getByText('Drop an image', { exact: true })).toBeVisible();
  await sendFile(page, content, 'drop', svg);
  await expect(caption).toHaveAttribute(
    'data-template',
    /^Before\{image:[^}]+\}After$/,
  );
  await expect(page.getByText('Drop an image', { exact: true })).toHaveCount(0);
  // Collapse a whole-document selection at the end, independent of how the
  // browser moves through the newly inserted atomic image.
  await caption.press('ControlOrMeta+a');
  await caption.press('ArrowRight');
  await sendFile(page, content, 'drop', {
    name: 'mark.png',
    type: 'image/png',
    base64: bytes,
  });
  await expect(caption).toHaveAttribute(
    'data-template',
    /^Before\{image:[^}]+\}After\{image:[^}]+\}$/,
  );
  await expect(
    page.getByRole('img', { name: 'Photo preview: photo.png', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
