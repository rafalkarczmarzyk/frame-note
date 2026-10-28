import type { Page } from '@playwright/test';

/** Select the ProseMirror document, including atom badges, before replacement.
 * DOM fill alone may leave non-editable metadata atoms in the document. */
export async function replaceCaption(page: Page, text: string) {
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.click();
  await editor.press('ControlOrMeta+a');
  await editor.press('Backspace');
  await editor.fill(text);
}
