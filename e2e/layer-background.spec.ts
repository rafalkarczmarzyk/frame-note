import { replaceCaption } from './caption-helpers.js';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('layer background controls affect JPG and retain settings under None', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/');
  const source = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 800, 600);
    return c.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'background.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  const editor = page.getByRole('textbox', { name: 'Caption', exact: true });
  await editor.click();
  await editor.press('ControlOrMeta+a');
  await editor.press('Backspace');
  await editor.pressSequentially('Background test');
  const group = page.getByRole('radiogroup', {
    name: 'Background type',
    exact: true,
  });
  await group.getByRole('radio', { name: 'Color', exact: true }).click();
  const settings = page.getByRole('region', {
    name: 'Background',
    exact: true,
  });
  await settings
    .getByRole('spinbutton', { name: 'Background opacity', exact: true })
    .fill('100');
  await settings
    .getByRole('spinbutton', { name: 'Background opacity', exact: true })
    .press('Tab');
  await settings
    .getByRole('switch', { name: 'Drop shadow', exact: true })
    .click();
  await expect(
    settings.getByRole('group', { name: 'Drop shadow settings' }),
  ).toBeVisible();
  const download = async () => {
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    return readFile((await (await pending).path())!);
  };
  const colored = await download();
  await group.getByRole('radio', { name: 'None', exact: true }).click();
  expect((await download()).equals(colored)).toBe(false);
  await group.getByRole('radio', { name: 'Color', exact: true }).click();
  await expect(
    settings.getByRole('spinbutton', {
      name: 'Background opacity',
      exact: true,
    }),
  ).toHaveValue('100');
  await expect(
    settings.getByRole('switch', { name: 'Drop shadow', exact: true }),
  ).toBeChecked();
  await settings.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath('background-controls.png'),
    fullPage: true,
  });
  // Layers owns the entire inspector, not just its list.
  await page.getByText('Layers', { exact: true }).click();
  await expect(settings).not.toBeVisible();
});

test('glass renders lower content with blur and matches its exported JPG', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/');
  const source = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    const ctx = c.getContext('2d')!;
    for (let y = 0; y < 600; y += 10)
      for (let x = 0; x < 800; x += 10) {
        ctx.fillStyle = (x + y) % 20 ? 'white' : 'gray';
        ctx.fillRect(x, y, 10, 10);
      }
    return c.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'checker.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  const preset = {
    version: 2,
    id: 'glass',
    name: 'Glass test',
    icons: [],
    layout: {
      sizingUnit: 'px',
      margins: { top: 30, right: 30, bottom: 30, left: 30 },
      marginLinkMode: 'all',
      activeId: 'top',
      containers: [
        {
          id: 'lower',
          template: 'UNDERLYING',
          position: { anchor: 'center' },
          style: {
            fontFamily: 'Montserrat Variable',
            fontWeight: 700,
            fontSize: 60,
            color: 'caption-black',
            opacity: 1,
            lineHeight: 1.4,
            textAlign: 'left',
          },
        },
        {
          id: 'top',
          template: 'Glass preview',
          position: { anchor: 'center' },
          style: {
            fontFamily: 'Montserrat Variable',
            fontWeight: 400,
            fontSize: 20,
            color: 'caption-white',
            opacity: 1,
            lineHeight: 1.4,
            textAlign: 'left',
          },
          background: {
            type: 'glass',
            color: 'charcoal',
            opacity: 0.25,
            padding: { top: 30, right: 30, bottom: 30, left: 30 },
            paddingLinkMode: 'all',
            radius: 10,
            blur: 8,
            shadow: {
              enabled: false,
              color: 'caption-black',
              opacity: 0.35,
              blur: 10,
              spread: 0,
              x: 0,
              y: 5,
            },
          },
        },
      ],
    },
  };
  await page
    .getByRole('button', { name: 'Preset actions', exact: true })
    .click();
  await page
    .getByRole('menuitem', { name: 'Manage presets', exact: true })
    .click();
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'glass.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  await page
    .getByRole('button', { name: 'Close manage presets', exact: true })
    .click();
  const button = page.getByRole('button', { name: 'Export JPG', exact: true });
  await expect(button).toBeEnabled();
  // The preview is generated asynchronously after the layout changes.
  await expect(page.locator('[data-photo-canvas]')).toHaveAttribute(
    'data-glass-ready',
    'true',
  );
  await page.mouse.move(0, 0);
  const download = async () => {
    await expect(button).toBeEnabled();
    const pending = page.waitForEvent('download');
    await button.click();
    return readFile((await (await pending).path())!);
  };
  const bytes = await download();
  const difference = await page.evaluate(async (base64) => {
    const scene = document.querySelector(
      '[data-photo-canvas] .konvajs-content canvas',
    ) as HTMLCanvasElement;
    const rect = scene.getBoundingClientRect();
    const ratio = scene.width / rect.width;
    const scale = Math.min(
      (rect.width - 56) / 800,
      (rect.height - 56) / 600,
      1,
    );
    const actual = document.createElement('canvas');
    actual.width = 800;
    actual.height = 600;
    actual
      .getContext('2d')!
      .drawImage(
        scene,
        ((rect.width - 800 * scale) / 2) * ratio,
        ((rect.height - 600 * scale) / 2) * ratio,
        800 * scale * ratio,
        600 * scale * ratio,
        0,
        0,
        800,
        600,
      );
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64}`;
    await image.decode();
    const expected = document.createElement('canvas');
    expected.width = 800;
    expected.height = 600;
    expected.getContext('2d')!.drawImage(image, 0, 0);
    const a = actual.getContext('2d')!.getImageData(0, 0, 800, 600).data;
    const b = expected.getContext('2d')!.getImageData(0, 0, 800, 600).data;
    let error = 0;
    for (let i = 0; i < a.length; i += 4)
      error +=
        Math.abs(a[i]! - b[i]!) +
        Math.abs(a[i + 1]! - b[i + 1]!) +
        Math.abs(a[i + 2]! - b[i + 2]!);
    return error / (800 * 600 * 3);
  }, bytes.toString('base64'));
  expect(difference).toBeLessThan(8);
  const blur = page.getByRole('spinbutton', {
    name: 'Glass blur',
    exact: true,
  });
  await blur.fill('0');
  await blur.press('Tab');
  expect((await download()).equals(bytes)).toBe(false);
  await blur.fill('8');
  await blur.press('Tab');
  await expect(button).toBeEnabled();
  await page.getByRole('button', { name: 'Hide layer 2', exact: true }).click();
  const hidden = await download();
  expect(hidden.equals(bytes)).toBe(false);
  // Compare only the glass interior, so this proves lower content is sampled
  // into the panel rather than merely disappearing elsewhere in the photo.
  const interiorDifference = await page.evaluate(
    async ({ before, after }) => {
      const pixels = async (base64: string) => {
        const image = new Image();
        image.src = `data:image/jpeg;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(335, 265, 130, 22).data;
      };
      const a = await pixels(before),
        b = await pixels(after);
      let error = 0;
      for (let i = 0; i < a.length; i += 4) error += Math.abs(a[i]! - b[i]!);
      return error / (130 * 22);
    },
    { before: bytes.toString('base64'), after: hidden.toString('base64') },
  );
  expect(interiorDifference).toBeGreaterThan(2);
  // Drag the visible glass panel using its padded hit area.
  const bounds = (await page
    .locator('[data-photo-canvas] .konvajs-content')
    .boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2 - 30,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 50,
    bounds.y + bounds.height / 2 - 60,
    { steps: 8 },
  );
  await page.mouse.up();
  const xPosition = page.getByRole('spinbutton', {
    name: 'X position',
    exact: true,
  });
  await expect(xPosition).toBeEnabled();
  await expect
    .poll(async () => Number(await xPosition.inputValue()))
    .toBeGreaterThan(50);
  const moved = await download();
  expect(moved.equals(hidden)).toBe(false);
  await page.locator('details[data-section="sizing"] > summary').click();
  await page
    .getByRole('combobox', { name: 'Sizing unit', exact: true })
    .click();
  await page
    .getByRole('option', { name: '% of short edge', exact: true })
    .click();
  expect((await download()).equals(moved)).toBe(true);
  await page
    .getByRole('combobox', { name: 'Sizing unit', exact: true })
    .click();
  await page.getByRole('option', { name: 'Pixels (px)', exact: true }).click();
  expect((await download()).equals(moved)).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('glass-production.png'),
    fullPage: true,
  });
  // Per-photo glass layouts survive switching and use the same batch renderer.
  await page.getByLabel('Choose JPG or PNG photo').setInputFiles({
    name: 'checker2.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(source, 'base64'),
  });
  await replaceCaption(page, 'Second glass');
  await page
    .getByRole('radiogroup', { name: 'Background type', exact: true })
    .getByRole('radio', { name: 'Glass', exact: true })
    .click();
  const second = await download();
  await page
    .getByRole('button', { name: 'Export actions', exact: true })
    .click();
  const zipDownload = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: 'Export all', exact: true }).click();
  const zip = await readFile((await (await zipDownload).path())!);
  const entries: Buffer[] = [];
  let offset = 0;
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    const size = zip.readUInt32LE(offset + 18);
    const start =
      offset +
      30 +
      zip.readUInt16LE(offset + 26) +
      zip.readUInt16LE(offset + 28);
    entries.push(zip.subarray(start, start + size));
    offset = start + size;
  }
  expect(entries).toHaveLength(2);
  expect(entries[0]!.equals(moved)).toBe(true);
  expect(entries[1]!.equals(second)).toBe(true);
});
