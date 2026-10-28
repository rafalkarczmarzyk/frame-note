import { expect, test } from '@playwright/test';

test('shows real spaces and line breaks without changing copied content or undo', async ({
  page,
}) => {
  await page.goto('/');
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.click();
  await editor.press('Meta+a');
  const content = 'A  B\nC {author}\n\nD';
  await editor.pressSequentially('A  B');
  await editor.press('Enter');
  await editor.pressSequentially('C {author}');
  await editor.press('Enter');
  await editor.press('Enter');
  await editor.pressSequentially('D');
  await expect(editor).toHaveAttribute('data-template', content);
  const marks = page.getByRole('button', {
    name: 'Show formatting marks',
    exact: true,
  });
  await expect(marks).toHaveAttribute('aria-pressed', 'true');
  await expect(editor.locator('.caption-whitespace-space')).toHaveCount(3);
  await expect(editor.locator('.caption-whitespace-newline')).toHaveCount(3);
  await expect(editor).toHaveAttribute('data-template', content);
  await editor.click();
  await editor.press('Meta+a');
  await editor.press('Meta+c');
  await editor.press('Backspace');
  await editor.press('Meta+v');
  await expect(editor).toHaveAttribute('data-template', content);
  await marks.click();
  await expect(editor.locator('.caption-whitespace-space')).toHaveCount(0);
  await expect(editor.locator('.caption-whitespace-newline')).toHaveCount(0);
  await editor.click();
  await editor.press('End');
  await editor.pressSequentially('x');
  await marks.click();
  await editor.press('Meta+z');
  await expect(editor).toHaveAttribute('data-template', content);
});
