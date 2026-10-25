import { expect, test } from '@playwright/test';
test('auto-scrolls a long layer list with a stationary pointer and preserves cancellation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 720 });
  await page.goto('/');
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    return canvas.toDataURL('image/jpeg').split(',')[1]!;
  });
  await page.getByLabel('Choose JPG photo').setInputFiles({
    name: 'test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(bytes, 'base64'),
  });
  const preset = {
    version: 2,
    id: 'long',
    name: 'Long list',
    icons: [],
    layout: {
      sizingUnit: 'px',
      marginLinkMode: 'none',
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      activeId: 'layer-30',
      containers: Array.from({ length: 30 }, (_, index) => ({
        id: `layer-${index + 1}`,
        template: `Layer ${String(index + 1).padStart(2, '0')}`,
        style: {
          fontFamily: 'Montserrat Variable',
          fontWeight: 400,
          fontSize: 10,
          color: 'porcelain',
          opacity: 1,
          lineHeight: 1.4,
          textAlign: 'left',
        },
        position: { anchor: 'center' },
      })),
    },
  };
  await page
    .getByRole('button', { name: 'Manage presets', exact: true })
    .click();
  await page.getByLabel('Import preset file').setInputFiles({
    name: 'long.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(preset)),
  });
  await expect(
    page.getByRole('combobox', { name: 'Saved preset', exact: true }),
  ).toContainText('Long list');
  await page
    .getByRole('button', { name: 'Close manage presets', exact: true })
    .click();
  const firstGrip = page.getByRole('button', {
    name: 'Reorder layer 1',
    exact: true,
  });
  await firstGrip.scrollIntoViewIfNeeded();
  await firstGrip.evaluate((node) => {
    for (
      let parent = node.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      if (
        /(auto|scroll)/u.test(getComputedStyle(parent).overflowY) &&
        parent.scrollHeight > parent.clientHeight
      ) {
        parent.dataset.testScrollHost = 'yes';
        break;
      }
    }
  });
  const host = page.locator('[data-test-scroll-host="yes"]');
  const bounds = (await host.boundingBox())!;
  const start = await host.evaluate((node) => node.scrollTop);
  const first = (await firstGrip.boundingBox())!;
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    first.x + first.width / 2,
    bounds.y + bounds.height - 3,
  );
  await expect
    .poll(() => host.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(start + 100);
  // No more mouse moves: scrolling must continue on animation frames.
  await expect
    .poll(() =>
      page
        .locator('[data-picker-row="29"]')
        .evaluate((node) => node.getBoundingClientRect().bottom),
    )
    .toBeLessThan(bounds.y + bounds.height);
  await page.mouse.up();
  const row = (index: number) =>
    page.locator(`[data-picker-row="${index}"] > button[aria-pressed]`);
  await expect(row(29)).toContainText('Layer 30');
  await expect(row(29)).toHaveAttribute('aria-pressed', 'true');
  const lastGrip = page.getByRole('button', {
    name: 'Reorder layer 30',
    exact: true,
  });
  await lastGrip.scrollIntoViewIfNeeded();
  const last = (await lastGrip.boundingBox())!;
  const bottomScroll = await host.evaluate((node) => node.scrollTop);
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2);
  await page.mouse.down();
  await page.mouse.move(last.x + last.width / 2, bounds.y + 3);
  await expect
    .poll(() => host.evaluate((node) => node.scrollTop))
    .toBeLessThan(bottomScroll - 100);
  await expect
    .poll(() =>
      page
        .locator('[data-picker-row="0"]')
        .evaluate((node) => node.getBoundingClientRect().top),
    )
    .toBeGreaterThan(bounds.y + 4);
  await page.mouse.up();
  await expect(row(0)).toContainText('Layer 30');
  await firstGrip.scrollIntoViewIfNeeded();
  const grip = (await firstGrip.boundingBox())!;
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2, bounds.y + bounds.height - 3);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(row(0)).toContainText('Layer 30');
  for (const cancellation of ['pointercancel', 'lostpointercapture']) {
    await firstGrip.scrollIntoViewIfNeeded();
    const box = (await firstGrip.boundingBox())!;
    await firstGrip.evaluate((node) =>
      node.addEventListener(
        'pointerdown',
        (event) => {
          (node as HTMLElement).dataset.pointerId = String(
            (event as PointerEvent).pointerId,
          );
        },
        { once: true },
      ),
    );
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, bounds.y + bounds.height - 3);
    if (cancellation === 'pointercancel')
      await firstGrip.dispatchEvent('pointercancel', { pointerId: 1 });
    else
      await firstGrip.evaluate((node) =>
        node.releasePointerCapture(
          Number((node as HTMLElement).dataset.pointerId),
        ),
      );
    await page.mouse.up();
    await expect(row(0)).toContainText('Layer 30');
  }
  await firstGrip.press('End');
  await expect(row(29)).toContainText('Layer 30');
  await page
    .getByRole('button', { name: 'Reorder layer 30', exact: true })
    .press('Home');
  await expect(row(0)).toContainText('Layer 30');
});
