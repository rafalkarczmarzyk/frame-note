import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('drags a caption without a jump and exports Custom independently of margins', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Choose JPG photo').setInputFiles(wildlifeFixture.path);
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
  await page.getByRole('radio', { name: 'Custom', exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'X position', exact: true }),
  ).toHaveValue('2');
  expect((await download()).equals(anchored)).toBe(true);

  const canvas = page.locator('canvas').first();
  const bounds = (await canvas.boundingBox())!;
  const { width, height } = wildlifeFixture.dimensions;
  const shortEdge = Math.min(width, height);
  const scale = Math.min(
    (bounds.width - 48) / width,
    (bounds.height - 48) / height,
    1,
  );
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
  await expect(inputX).toHaveCount(0);
  expect((await download()).equals(positioned)).toBe(false);
});
