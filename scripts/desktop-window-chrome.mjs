import { expect } from '@playwright/test';
import console from 'node:console';
import { execFileSync } from 'node:child_process';
import process from 'node:process';

/** Layout and interaction checks run in the real Electron renderer. */
export async function verifyWindowChrome(
  app,
  page,
  { nativeTransitions = true } = {},
) {
  if (process.platform === 'darwin') {
    const name = execFileSync(
      '/usr/bin/osascript',
      [
        '-l',
        'JavaScript',
        '-e',
        `ObjC.import('AppKit'); $.NSRunningApplication.runningApplicationWithProcessIdentifier(${app.process().pid}).localizedName.js`,
      ],
      { encoding: 'utf8' },
    ).trim();
    expect(name).toBe('FrameNote');
    const menu = await app.evaluate(
      ({ Menu }) => Menu.getApplicationMenu().items[0].label,
    );
    expect(menu).toBe('FrameNote');
  }
  const initial = await app.evaluate(({ BrowserWindow, screen }) => {
    const window = BrowserWindow.getAllWindows()[0];
    const bounds = window.getBounds();
    return { bounds, workArea: screen.getDisplayMatching(bounds).workArea };
  });
  const { bounds: initialBounds, workArea } = initial;
  expect(initialBounds.width).toBe(Math.min(2240, workArea.width));
  expect(initialBounds.height).toBe(Math.min(1560, workArea.height));
  expect(initialBounds.x).toBeCloseTo(
    workArea.x + Math.floor((workArea.width - initialBounds.width) / 2),
    0,
  );
  expect(initialBounds.y).toBeCloseTo(
    workArea.y + Math.floor((workArea.height - initialBounds.height) / 2),
    0,
  );
  console.log(
    'Startup window fits and is centered within the display work area.',
    initial,
  );
  const header = page.getByRole('banner');
  const titlebar = page.locator('[data-window-titlebar]');
  await expect(titlebar).toHaveText('FrameNote');
  await expect(header).toHaveAttribute('data-platform', 'macos');
  await expect(
    header.getByRole('button', { name: 'About FrameNote', exact: true }),
  ).toHaveCount(0);
  await page.locator('[data-preset-live]').waitFor();
  for (const width of [1440, 800]) {
    await app.evaluate(({ BrowserWindow }, width) => {
      BrowserWindow.getAllWindows()[0].setSize(width, 900);
    }, width);
    await expect
      .poll(() => page.evaluate(() => globalThis.innerWidth))
      .toBe(width);
    const bounds = await header.boundingBox();
    expect(bounds.y).toBe(28);
    expect(bounds.height).toBe(49);
    const titleBounds = await titlebar.boundingBox();
    expect(titleBounds).toMatchObject({ x: 0, y: 0, width, height: 28 });
    const appearance = await titlebar.evaluate((node) => {
      const style = globalThis.getComputedStyle(node);
      const label = node.ownerDocument.createRange();
      label.selectNodeContents(node);
      const rect = label.getBoundingClientRect();
      return {
        background: style.backgroundColor,
        drag: style.getPropertyValue('-webkit-app-region'),
        titleCenter: rect.x + rect.width / 2,
      };
    });
    expect(appearance.titleCenter).toBeCloseTo(width / 2, 0);
    expect(appearance.drag).toBe('drag');
    expect(appearance.background).toBe(
      await header.evaluate(
        (node) => globalThis.getComputedStyle(node).backgroundColor,
      ),
    );
    const names = [
      'Add photos',
      'Saved preset',
      'Save preset',
      'Preset actions',
      'Export JPG',
      'Export actions',
    ];
    let previousRight = 0;
    for (const name of names) {
      const control = header.getByRole(
        name === 'Saved preset' ? 'combobox' : 'button',
        { name, exact: true },
      );
      const rect = await control.boundingBox();
      expect(rect, name).not.toBeNull();
      expect(rect.x, name).toBeGreaterThanOrEqual(previousRight - 1);
      expect(rect.x + rect.width, name).toBeLessThanOrEqual(width);
      expect(rect.width, name).toBeGreaterThanOrEqual(28);
      expect(rect.y - bounds.y, name).toBe(6);
      expect(bounds.y + bounds.height - 1 - rect.y - rect.height, name).toBe(6);
      if (name === 'Add photos') expect(rect.x).toBe(6);
      if (name === 'Export actions')
        expect(width - rect.x - rect.width).toBe(6);
      previousRight = rect.x + rect.width;
    }
    expect(
      await header.evaluate((node) =>
        globalThis
          .getComputedStyle(node)
          .getPropertyValue('-webkit-app-region'),
      ),
    ).not.toBe('drag');
    await app.evaluate(({ Menu }) => {
      const about = Menu.getApplicationMenu().items[0].submenu.items.find(
        (item) => item.label === 'About FrameNote',
      );
      if (!about) throw new Error('About FrameNote menu item missing');
      about.click();
    });
    const about = page.getByRole('dialog', {
      name: 'Leave your mark.',
      exact: true,
    });
    await expect(about).toBeVisible();
    await about
      .getByRole('button', { name: 'Close about FrameNote', exact: true })
      .click();
    await header.getByRole('combobox', { name: 'Saved preset' }).click();
    await expect(
      page.getByRole('option', { name: 'Default', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.screenshot({
      path: `release/FrameNote-macOS-header-${width}.png`,
    });
  }
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(1440, 960),
  );
  if (!nativeTransitions) {
    console.log(
      'Window geometry and toolbar passed; native minimize/fullscreen checks explicitly skipped.',
    );
    return;
  }
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].minimize(),
  );
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isMinimized(),
      ),
    )
    .toBe(true);
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].restore(),
  );
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isMinimized(),
      ),
    )
    .toBe(false);
  await app.evaluate(({ app, BrowserWindow }) => {
    app.focus({ steal: true });
    BrowserWindow.getAllWindows()[0].focus();
  });
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFocused(),
      ),
    )
    .toBe(true);
  await app.evaluate(
    ({ BrowserWindow }) =>
      new Promise((resolve, reject) => {
        const window = BrowserWindow.getAllWindows()[0];
        const timer = globalThis.setTimeout(
          () => reject(new Error('Timed out entering native fullscreen')),
          15000,
        );
        window.once('enter-full-screen', () => {
          globalThis.clearTimeout(timer);
          resolve();
        });
        window.setFullScreen(true);
      }),
  );
  await expect
    .poll(
      () =>
        app.evaluate(({ BrowserWindow }) =>
          BrowserWindow.getAllWindows()[0].isFullScreen(),
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
  await app.evaluate(
    ({ BrowserWindow }) =>
      new Promise((resolve, reject) => {
        const window = BrowserWindow.getAllWindows()[0];
        const timer = globalThis.setTimeout(
          () => reject(new Error('Timed out leaving native fullscreen')),
          15000,
        );
        window.once('leave-full-screen', () => {
          globalThis.clearTimeout(timer);
          resolve();
        });
        window.setFullScreen(false);
      }),
  );
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
    )
    .toBe(false);
  console.log(
    'macOS title bar: 28px height, centered app name and matching toolbar background; toolbar with equal 6px padding on all sides and no overlap at 1440/800px, interactive controls, minimize/restore and fullscreen roundtrip passed.',
  );
}
