import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('edits independent containers, selects on canvas and exports the whole layout', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG or PNG photo')
    .setInputFiles(wildlifeFixture.path);
  const caption = page.getByLabel('Caption', { exact: true });
  await caption.fill('First caption');
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await expect(caption).toHaveAttribute('data-template', '');
  await caption.fill('Second caption');
  await page.getByRole('button', { name: 'top-right', exact: true }).click();
  await page
    .getByRole('spinbutton', { name: 'Font size', exact: true })
    .fill('3');
  await page.getByRole('button', { name: /First caption/ }).click();
  await expect(caption).toHaveAttribute('data-template', 'First caption');
  await expect(
    page.getByRole('spinbutton', { name: 'Font size', exact: true }),
  ).toHaveValue('2');
  await page
    .getByRole('combobox', { name: 'Sizing unit', exact: true })
    .click();
  await page.getByRole('option', { name: 'Pixels (px)', exact: true }).click();
  const shortEdge = Math.min(
    wildlifeFixture.dimensions.width,
    wildlifeFixture.dimensions.height,
  );
  await expect(
    page.getByRole('spinbutton', { name: 'Font size', exact: true }),
  ).toHaveValue(String(shortEdge * 0.02));
  await page.getByRole('button', { name: /Second caption/ }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Font size', exact: true }),
  ).toHaveValue(String(shortEdge * 0.03));

  // Click inside the first caption's measured block in the scaled image.
  const canvas = page.locator('canvas').first();
  const bounds = (await canvas.boundingBox())!;
  const { width, height } = wildlifeFixture.dimensions;
  const rulerBounds = (await page
    .getByRole('group', { name: 'Horizontal margin ruler', exact: false })
    .boundingBox())!;
  const scale = rulerBounds.width / width;
  const x = (bounds.width - width * scale) / 2 + shortEdge * 0.03 * scale + 3;
  const y =
    (bounds.height - height * scale) / 2 +
    height * scale -
    shortEdge * 0.03 * scale -
    shortEdge * 0.02 * scale;
  await canvas.click({ position: { x, y } });
  await expect(caption).toHaveAttribute('data-template', 'First caption');

  async function downloadImage() {
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    const path = await (await pending).path();
    return (await readFile(path!)).toString('base64');
  }
  const globalLeft = page.getByRole('spinbutton', {
    name: 'Left',
    exact: true,
  });
  await globalLeft.fill('100');
  await page.getByRole('button', { name: /Second caption/ }).click();
  await expect(globalLeft).toHaveValue('100');
  await page.getByRole('button', { name: /First caption/ }).click();
  const both = await downloadImage();
  await page
    .getByRole('button', { name: 'Layer 2 actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await expect(caption).toHaveAttribute('data-template', 'Second caption');
  const secondOnly = await downloadImage();
  const changes = await page.evaluate(
    async ({ both, secondOnly }) => {
      async function pixels(encoded: string) {
        const image = new Image();
        image.src = `data:image/jpeg;base64,${encoded}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        return {
          data: context.getImageData(0, 0, canvas.width, canvas.height).data,
          width: canvas.width,
          height: canvas.height,
        };
      }
      const a = await pixels(both),
        b = await pixels(secondOnly);
      let bottomLeft = 0,
        topRight = 0;
      for (let y = 0; y < a.height; y++)
        for (let x = 0; x < a.width; x++) {
          const i = (y * a.width + x) * 4;
          if (
            Math.max(
              ...[0, 1, 2].map((channel) =>
                Math.abs(a.data[i + channel]! - b.data[i + channel]!),
              ),
            ) > 40
          ) {
            if (x < a.width / 2 && y > a.height / 2) bottomLeft++;
            if (x > a.width / 2 && y < a.height / 2) topRight++;
          }
        }
      return { bottomLeft, topRight };
    },
    { both, secondOnly },
  );
  expect(changes.bottomLeft).toBeGreaterThan(100);
  expect(changes.topRight).toBe(0);
  const actions = page.getByRole('button', {
    name: 'Layer 1 actions',
    exact: true,
  });
  await actions.press('ArrowUp');
  await expect(
    page.getByRole('menuitem', { name: 'Delete', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Home');
  await expect(
    page.getByRole('menuitem', { name: 'Duplicate', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(actions).toBeFocused();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Layer 1 actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /Second caption/ }),
  ).toHaveCount(2);
  await page
    .getByRole('button', { name: 'Layer 1 actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await page
    .getByRole('button', { name: 'Layer 1 actions', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('Add a layer to begin.')).toBeVisible();
  await expect(globalLeft).toHaveValue('100');
  await page.getByRole('button', { name: 'Add layer', exact: true }).click();
  await expect(caption).toHaveAttribute('data-template', '');
});
