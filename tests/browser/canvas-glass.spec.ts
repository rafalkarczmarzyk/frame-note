import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

for (const story of ['glass', 'overlap', 'photo-edge']) {
  test(`canvas glass / ${story} / pixels and JPG`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/iframe.html?id=proposals-canvasglasstrial--${story}&viewMode=story`,
    );
    const exportButton = page.getByRole('button', { name: 'Export trial JPG' });
    await expect(exportButton).toBeEnabled({ timeout: 30000 });
    await expect(page.getByRole('alert')).toHaveCount(0);
    const canvas = page.getByRole('img', { name: 'Canvas glass preview' });
    const initial = await canvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      return {
        width: canvas.width,
        height: canvas.height,
        pixels: Array.from(
          canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height).data,
        ),
      };
    });
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const file = await (await downloadPromise).path();
    const bytes = await readFile(file!);
    expect(bytes[0]).toBe(255);
    expect(bytes[1]).toBe(216);
    const comparison = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${base64}`;
      await image.decode();
      const preview = document.querySelector(
        'canvas[aria-label="Canvas glass preview"]',
      ) as HTMLCanvasElement;
      const copy = document.createElement('canvas');
      copy.width = image.width;
      copy.height = image.height;
      copy.getContext('2d')!.drawImage(image, 0, 0);
      const a = preview
        .getContext('2d')!
        .getImageData(0, 0, image.width, image.height).data;
      const b = copy
        .getContext('2d')!
        .getImageData(0, 0, image.width, image.height).data;
      let error = 0;
      for (let i = 0; i < a.length; i += 4)
        error +=
          Math.abs(a[i]! - b[i]!) +
          Math.abs(a[i + 1]! - b[i + 1]!) +
          Math.abs(a[i + 2]! - b[i + 2]!);
      return {
        width: image.width,
        height: image.height,
        meanError: error / (image.width * image.height * 3),
      };
    }, bytes.toString('base64'));
    expect(comparison.width).toBe(initial.width);
    expect(comparison.height).toBe(initial.height);
    expect(comparison.meanError).toBeLessThan(5);
    await page
      .getByRole('spinbutton', { name: 'Glass blur', exact: true })
      .fill('0');
    await page
      .getByRole('spinbutton', { name: 'Glass blur', exact: true })
      .press('Tab');
    await expect(exportButton).toBeEnabled();
    // The corner fixture is almost uniform; changing tint coverage provides a
    // useful pixel assertion there, while the other scenes exercise blur detail.
    if (story === 'photo-edge') {
      await page
        .getByRole('spinbutton', { name: 'Base opacity', exact: true })
        .fill('100');
      await page
        .getByRole('spinbutton', { name: 'Base opacity', exact: true })
        .press('Tab');
      await expect(exportButton).toBeEnabled();
    }
    const difference = await canvas.evaluate((element, previous) => {
      const canvas = element as HTMLCanvasElement;
      const next = canvas
        .getContext('2d')!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let changed = 0;
      for (let i = 0; i < next.length; i += 4)
        if (Math.abs(next[i]! - previous[i]!) > 3) changed++;
      return changed;
    }, initial.pixels);
    expect(difference).toBeGreaterThan(100);
    if (story === 'photo-edge') {
      await page
        .getByRole('spinbutton', { name: 'Base opacity', exact: true })
        .fill('25');
      await page
        .getByRole('spinbutton', { name: 'Base opacity', exact: true })
        .press('Tab');
      await expect(exportButton).toBeEnabled();
    }
    await page
      .getByRole('spinbutton', { name: 'Glass blur', exact: true })
      .fill('0.8');
    await page
      .getByRole('spinbutton', { name: 'Glass blur', exact: true })
      .press('Tab');
    await expect(exportButton).toBeEnabled();
    await page.screenshot({
      path: testInfo.outputPath('canvas-glass.png'),
      fullPage: true,
    });
    if (story === 'glass') {
      await page.getByRole('switch', { name: 'Full photo resolution' }).click();
      await expect(exportButton).toBeEnabled({ timeout: 60000 });
      await expect(page.getByRole('status')).toContainText('5964 × 3976');
      console.log(
        `${testInfo.project.name}: ${await page.getByRole('status').textContent()}`,
      );
      await page.getByRole('button', { name: 'Bright photo' }).click();
      await expect(exportButton).toBeEnabled({ timeout: 60000 });
      await expect(page.getByRole('alert')).toHaveCount(0);
    }
  });
}

for (const story of [
  'color-layer-background',
  'glass-layer-background',
  'glass-portrait-background',
]) {
  test(`production background / ${story} / full photo JPG`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/iframe.html?id=screens-testphotos--${story}&viewMode=story`,
    );
    const button = page.getByRole('button', {
      name: 'Export JPG',
      exact: true,
    });
    await expect(button).toBeEnabled({ timeout: 60000 });
    await expect(page.getByRole('alert')).toHaveCount(0);
    if (story.startsWith('glass'))
      await expect(page.locator('[data-photo-canvas]')).toHaveAttribute(
        'data-glass-ready',
        'true',
      );
    await page.mouse.move(0, 0);
    await page.screenshot({
      path: testInfo.outputPath('production-background.png'),
      fullPage: true,
    });
    const pending = page.waitForEvent('download');
    await button.click();
    const bytes = await readFile((await (await pending).path())!);
    const dimensions = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${base64}`;
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    }, bytes.toString('base64'));
    expect(dimensions.width).toBeGreaterThan(3000);
    expect(dimensions.height).toBeGreaterThan(3000);
    expect(
      story.includes('portrait')
        ? dimensions.height > dimensions.width
        : dimensions.width > dimensions.height,
    ).toBe(true);
  });
}
