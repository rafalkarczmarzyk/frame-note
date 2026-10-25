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
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'layers.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(jpeg, 'base64'),
  });
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
    .getByRole('button', { name: 'Reorder layer 2', exact: true })
    .scrollIntoViewIfNeeded();
  const top = await page
    .getByRole('button', { name: 'Reorder layer 1', exact: true })
    .boundingBox();
  const bottom = await page
    .getByRole('button', { name: 'Reorder layer 2', exact: true })
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
    .getByRole('button', { name: 'Reorder layer 1', exact: true })
    .press('ArrowDown');
  expect((await center())[2]).toBeGreaterThan(240);
});
