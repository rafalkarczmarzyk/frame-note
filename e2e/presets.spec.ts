import { expect, test } from '@playwright/test';

test('saves and restores a layout after reload and imports an exported preset', async ({
  page,
}) => {
  await page.goto('/');
  // Generate a small local image so this flow does not depend on fixture filenames.
  const data = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    return c.toDataURL('image/jpeg').split(',')[1]!;
  });
  const photo = {
    name: 'preset.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(data, 'base64'),
  };
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await page.getByLabel('Caption', { exact: true }).fill('Saved {author}');
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page.getByLabel('Preset name', { exact: true }).fill('Wildlife');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByLabel('Caption', { exact: true }).fill('Changed');
  await expect(
    page.getByText('Unsaved changes', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByRole('button', { name: 'Wildlife', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'Saved {author}',
  );
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Duplicate Wildlife', exact: true })
    .click();
  await page
    .getByLabel('Preset name', { exact: true })
    .fill('Wildlife copy renamed');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Wildlife copy renamed', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Delete Wildlife copy renamed', exact: true })
    .click();
  const pending = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Export preset', exact: true })
    .click();
  const path = await (await pending).path();
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Delete Wildlife', exact: true })
    .click();
  await page.getByLabel('Import preset file').setInputFiles(path!);
  await expect(
    page.getByRole('combobox', { name: 'Saved preset', exact: true }),
  ).toContainText('Wildlife');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    'Saved {author}',
  );
});

test('offers built-in Default and Macro and resolves the Helicon fixture', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Choose JPG photo')
    .setInputFiles('tests/fixtures/20261020-2026-10-20 14-06-39 (A,R8,S4).jpg');
  await page.getByRole('combobox', { name: 'Saved preset' }).click();
  await page.getByRole('option', { name: 'Default dark', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Manage presets' }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByRole('button', { name: 'Macro', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Manage presets' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Default dark', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Manage presets' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Macro', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{heliconStack}',
  );
  await expect(
    page.getByRole('button', { name: 'Delete Wildlife', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Update preset', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Browse available tags', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Available tags' }),
  ).toContainText('Focus stack · 15 images · Method A · R=8 · S=4');
  await page.getByRole('button', { name: 'Close available tags' }).click();
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveAttribute(
    'data-template',
    '{author}\n{lens}\n{exposure}',
  );
});

test('restores SVG assets, blank lines and custom positions across photo orientations', async ({
  page,
}) => {
  const { readFile } = await import('node:fs/promises');
  const square = {
    name: 'custom-square',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="currentColor"/></svg>',
    aspect: 1,
  };
  const green = {
    ...square,
    name: 'Signature.svg',
    svg: square.svg.replace('currentColor', '#00ff00'),
  };
  const style = {
    fontFamily: 'Montserrat Variable',
    fontWeight: 400,
    fontSize: 12,
    color: '#FF0000',
    opacity: 1,
    lineHeight: 1.4,
    textAlign: 'left',
  };
  const preset = {
    version: 1,
    id: 'portable-svg',
    name: 'Portable SVG',
    icons: [square],
    layout: {
      sizingUnit: 'short-edge',
      margins: { top: 3, right: 3, bottom: 3, left: 3 },
      marginLinkMode: 'none',
      activeId: 'signature',
      containers: [
        {
          id: 'text',
          template: '{icon:custom-square}\n\nLine',
          style,
          position: { anchor: 'top-left' },
        },
        {
          id: 'signature',
          template: '',
          style,
          position: { anchor: 'center', custom: { x: 80, y: 20 } },
          logo: { asset: green, width: 20, colorMode: 'original' },
        },
      ],
    },
  };
  await page.goto('/');
  // Exercise preset creation without the secure-context-only randomUUID API (LAN HTTP).
  await page.evaluate(() =>
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    }),
  );
  const uploadPhoto = async (width: number, height: number) => {
    const bytes = await page.evaluate(
      ({ width, height }) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d')!;
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);
        return canvas.toDataURL('image/jpeg').split(',')[1]!;
      },
      { width, height },
    );
    await page.getByLabel('Choose JPG photo').setInputFiles({
      name: 'orientation.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from(bytes, 'base64'),
    });
  };
  await uploadPhoto(1200, 800);
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  const unsafe = structuredClone(preset);
  unsafe.icons[0]!.svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script></svg>';
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'unsafe.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(unsafe)),
  });
  await expect(page.getByRole('alert')).toContainText(
    'Unsupported SVG element',
  );
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'portable.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Close manage presets', exact: true })
    .click();
  await page.reload();
  await page.evaluate(() =>
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    }),
  );
  await uploadPhoto(1200, 800);
  await page
    .getByRole('combobox', { name: 'Saved preset', exact: true })
    .click();
  await page.getByRole('option', { name: 'Portable SVG', exact: true }).click();
  for (const [width, height] of [
    [1200, 800],
    [800, 1200],
  ] as const) {
    await uploadPhoto(width, height);
    const ready = page.getByRole('button', { name: 'Export JPG', exact: true });
    await expect(ready).toBeEnabled();
    const pending = page.waitForEvent('download');
    await ready.click();
    const bytes = await readFile((await (await pending).path())!);
    const result = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      const green = Array.from(
        context.getImageData(
          Math.round(image.width * 0.8),
          Math.round(image.height * 0.2),
          1,
          1,
        ).data,
      );
      const red = Array.from(context.getImageData(72, 90, 1, 1).data);
      const redPixels = (y: number, height: number) => {
        const pixels = context.getImageData(24, y, 450, height).data;
        let count = 0;
        for (let i = 0; i < pixels.length; i += 4)
          if (pixels[i]! > 200 && pixels[i + 1]! < 30 && pixels[i + 2]! < 30)
            count++;
        return count;
      };
      return {
        width: image.width,
        height: image.height,
        green,
        red,
        gapRed: redPixels(165, 110),
        lineRed: redPixels(300, 150),
      };
    }, bytes.toString('base64'));
    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
    expect(result.green[1]).toBeGreaterThan(240);
    expect(result.green[0]).toBeLessThan(15);
    expect(result.red[0]).toBeGreaterThan(240);
    expect(result.red[1]).toBeLessThan(15);
    expect(result.gapRed).toBe(0);
    expect(result.lineRed).toBeGreaterThan(200);
  }
});

test('keeps long-name duplicates and valid presets alongside damaged entries', async ({
  page,
}) => {
  await page.goto('/');
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 60;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  const photo = {
    name: 'small.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(data, 'base64'),
  };
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  const name = 'x'.repeat(80);
  await page.getByLabel('Preset name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .getByRole('button', { name: `Duplicate ${name}`, exact: true })
    .click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.evaluate(() => {
    const key = 'framenote.presets.v1';
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.push({ damaged: 'retain this data' });
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await page.getByLabel('Choose JPG photo').setInputFiles(photo);
  await expect(page.getByRole('alert')).toContainText(
    'original data is preserved',
  );
  await expect(
    page.getByRole('button', { name: 'Download recovery copy' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  const copy = `${'x'.repeat(75)} copy`;
  await expect(
    page.getByRole('button', { name: copy, exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: `Delete ${copy}`, exact: true })
    .click();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('framenote.presets.v1')!),
    ),
  ).toContainEqual({ damaged: 'retain this data' });
});
