import { expect, test } from '@playwright/test';

test('opens the bootstrap screen without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('FrameNote');
  await expect(
    page.getByRole('heading', { name: 'Every frame has a story.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Choose a photo' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('img', { name: 'FrameNote', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('shows the full-page file drop state and dismisses it on drop', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File(['fixture'], 'photo.jpg', { type: 'image/jpeg' }),
    );
    window.dispatchEvent(
      new DragEvent('dragenter', { dataTransfer, cancelable: true }),
    );
  });
  await expect(page.getByRole('status')).toHaveText('Drop your photo');
  await page.evaluate(() =>
    window.dispatchEvent(new DragEvent('drop', { cancelable: true })),
  );
  await expect(page.getByRole('status')).toHaveCount(0);
});
