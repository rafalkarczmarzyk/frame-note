import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('drags a caption without a jump and exports Custom independently of margins', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  await page.getByLabel('Caption', { exact: true }).fill('Custom position');
  const exportButton = page.getByRole('button', {
    name: 'Export JPG',
    exact: true,
  });
  const download = async () => {
    await expect(exportButton).toBeEnabled();
    const pending = page.waitForEvent('download');
    await exportButton.click();
    return readFile((await (await pending).path())!);
  };
  const anchored = await download();
  await expect(
    page.getByRole('spinbutton', { name: 'X position', exact: true }),
  ).toBeDisabled();
  await page.getByRole('radio', { name: 'Manual', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'bottom-left', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('spinbutton', { name: 'X position', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('spinbutton', { name: 'X position', exact: true }),
  ).toHaveValue('2');
  expect((await download()).equals(anchored)).toBe(true);

  const canvas = page.locator('canvas').first();
  const bounds = (await canvas.boundingBox())!;
  const { width, height } = wildlifeFixture.dimensions;
  const shortEdge = Math.min(width, height);
  const rulerBounds = (await page
    .getByRole('group', { name: 'Horizontal margin ruler', exact: false })
    .boundingBox())!;
  const scale = rulerBounds.width / width;
  const x =
    bounds.x +
    (bounds.width - width * scale) / 2 +
    shortEdge * 0.03 * scale +
    5;
  const y =
    bounds.y +
    (bounds.height - height * scale) / 2 +
    height * scale -
    shortEdge * 0.03 * scale -
    shortEdge * 0.02 * scale;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 80, y - 60, { steps: 10 });
  await page.mouse.up();
  const inputX = page.getByRole('spinbutton', {
    name: 'X position',
    exact: true,
  });
  await expect
    .poll(async () => Number(await inputX.inputValue()))
    .toBeGreaterThan(2);
  const moved = await download();
  expect(moved.equals(anchored)).toBe(false);
  await page.getByRole('spinbutton', { name: 'Left', exact: true }).fill('8');
  expect((await download()).equals(moved)).toBe(true);
  await inputX.fill('50');
  await page
    .getByRole('spinbutton', { name: 'Y position', exact: true })
    .fill('50');
  const positioned = await download();
  expect(positioned.equals(moved)).toBe(false);
  await page.getByRole('radio', { name: 'Anchor', exact: true }).click();
  await page.getByRole('button', { name: 'bottom-right', exact: true }).click();
  await expect(inputX).toBeDisabled();
  expect((await download()).equals(positioned)).toBe(false);
});
