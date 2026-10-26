import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('reorders overlapping layers by dragging and keyboard and hides them from export', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('/');
  const jpeg = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'layers.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(jpeg, 'base64'),
  });
  const preview = page.locator('[data-picker-choice]').first();
  await expect(preview).toHaveText('author · lens · exposure');
  await expect(preview).not.toContainText('{');
  const layers = ['red', 'blue'].map((color) => ({
    id: color,
    template: `{image:${color}:100:document:original}`,
    images: [
      {
        id: color,
        name: `${color}.svg`,
        format: 'svg',
        source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="${color}"/></svg>`,
        width: 1,
        height: 1,
      },
    ],
    style: {
      fontFamily: 'Montserrat Variable',
      fontWeight: 400,
      fontSize: 20,
      color: 'porcelain',
      opacity: 1,
      lineHeight: 1.4,
      textAlign: 'left',
    },
    position: { anchor: 'center' },
  }));
  const preset = {
    version: 2,
    id: 'stack',
    name: 'Stack',
    icons: [],
    layout: {
      sizingUnit: 'px',
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      marginLinkMode: 'none',
      activeId: 'blue',
      containers: layers,
    },
  };
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'stack.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  await page
    .getByRole('button', { name: 'Close manage presets', exact: true })
    .click();
  async function center() {
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    const bytes = await readFile((await (await pending).path())!);
    return page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return Array.from(context.getImageData(400, 300, 1, 1).data);
    }, bytes.toString('base64'));
  }
  expect((await center())[2]).toBeGreaterThan(240);
  await page
    .locator('[data-picker-row="1"] > [data-picker-choice]')
    .scrollIntoViewIfNeeded();
  const top = await page
    .locator('[data-picker-row="0"] > [data-picker-choice]')
    .boundingBox();
  const bottom = await page
    .locator('[data-picker-row="1"] > [data-picker-choice]')
    .boundingBox();
  await page.mouse.move(top!.x + top!.width / 2, top!.y + top!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    bottom!.x + bottom!.width / 2,
    bottom!.y + bottom!.height + 12,
    { steps: 8 },
  );
  await page.mouse.up();
  expect((await center())[0]).toBeGreaterThan(240);
  await page.getByRole('button', { name: 'Hide layer 1', exact: true }).click();
  expect((await center())[2]).toBeGreaterThan(240);
  await page.getByRole('button', { name: 'Show layer 1', exact: true }).click();
  await page
    .locator('[data-picker-row="0"] > [data-picker-choice]')
    .press('ArrowDown');
  expect((await center())[2]).toBeGreaterThan(240);
  for (const [row, action, channel] of [
    [1, 'Move down', 0],
    [2, 'Move up', 2],
    [1, 'Send to back', 0],
    [2, 'Bring to front', 2],
  ] as const) {
    await page
      .getByRole('button', { name: `Layer ${row} actions`, exact: true })
      .click();
    await expect(
      page.getByRole('menuitem', {
        name: row === 1 ? 'Move up' : 'Move down',
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole('menuitem', {
        name: row === 1 ? 'Bring to front' : 'Send to back',
        exact: true,
      }),
    ).toBeDisabled();
    // Arrow navigation skips disabled directions.
    await page
      .getByRole('menuitem', { name: 'Duplicate', exact: true })
      .press('ArrowDown');
    await expect(
      page.getByRole('menuitem', {
        name: row === 1 ? 'Move down' : 'Move up',
        exact: true,
      }),
    ).toBeFocused();
    await page.getByRole('menuitem', { name: action, exact: true }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(
      page.getByRole('button', {
        name: `Layer ${row === 1 ? 2 : 1} actions`,
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.locator('[data-picker-choice][aria-pressed="true"]'),
    ).toContainText('blue.svg');
    expect((await center())[channel]).toBeGreaterThan(240);
  }
  // Dragging an unselected row reorders it without turning the drop into a click.
  const redRow = page.locator('[data-picker-row="1"] > [data-picker-choice]');
  await redRow.scrollIntoViewIfNeeded();
  const redBox = (await redRow.boundingBox())!;
  const blueBox = (await page
    .locator('[data-picker-row="0"] > [data-picker-choice]')
    .boundingBox())!;
  await page.mouse.move(
    redBox.x + redBox.width / 2,
    redBox.y + redBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(blueBox.x + blueBox.width / 2, blueBox.y - 4, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(
    page.locator('[data-picker-row="0"] > [data-picker-choice]'),
  ).toContainText('red.svg');
  await expect(
    page.locator('[data-picker-choice][aria-pressed="true"]'),
  ).toContainText('blue.svg');
  expect((await center())[0]).toBeGreaterThan(240);
  await page.locator('[data-picker-row="0"] > [data-picker-choice]').click();
  await expect(
    page.locator('[data-picker-choice][aria-pressed="true"]'),
  ).toContainText('red.svg');
  // A small hand movement remains a normal selection click, not a reorder.
  const blueRow = page.locator('[data-picker-row="1"] > [data-picker-choice]');
  const clickBox = (await blueRow.boundingBox())!;
  await page.mouse.move(
    clickBox.x + clickBox.width / 2,
    clickBox.y + clickBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    clickBox.x + clickBox.width / 2 + 2,
    clickBox.y + clickBox.height / 2,
  );
  await page.mouse.up();
  await expect(
    page.locator('[data-picker-choice][aria-pressed="true"]'),
  ).toContainText('blue.svg');
  await expect(
    page.locator('[data-picker-row="0"] > [data-picker-choice]'),
  ).toContainText('red.svg');
});
