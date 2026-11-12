import { _electron as electron, expect } from '@playwright/test';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  readdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

/** Native persistence and modal checks use an isolated profile, never user data. */
export async function checkDesktopConfiguration({ executable, env }) {
  const root = await mkdtemp(join(tmpdir(), 'framenote-settings-'));
  const profile = join(root, 'profile');
  const directory = join(profile, 'FrameNote');
  const file = join(directory, 'config.json');
  let app;
  const launch = async ({ about = false } = {}) => {
    app = await electron.launch({
      executablePath: executable,
      args: [
        ...(process.env.FRAMENOTE_PACKAGED ? [] : [resolve('apps/desktop')]),
        `--user-data-dir=${profile}`,
      ],
      env: { ...env, FRAMENOTE_TEST_UPDATE_FEED: '1' },
    });
    const page = await app.firstWindow();
    await page.waitForLoadState('networkidle');
    await page.locator('header[data-platform]').waitFor();
    const startupAboutClose = page.getByRole('button', {
      name: 'Close about FrameNote',
      exact: true,
    });
    if (about) {
      await expect(startupAboutClose).toBeVisible();
      await startupAboutClose.click();
    } else await expect(startupAboutClose).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Add layer', exact: true })
      .waitFor();
    await app.evaluate(({ app, BrowserWindow }) => {
      app.focus({ steal: true });
      BrowserWindow.getAllWindows()[0].focus();
    });
    return page;
  };
  const stop = async () => {
    await app?.close();
    app = undefined;
  };
  const openSettings = () =>
    app.evaluate(({ Menu }) =>
      Menu.getApplicationMenu().getMenuItemById('app-settings').click(),
    );
  const read = async () => JSON.parse(await readFile(file, 'utf8'));
  try {
    // A legacy quality is imported only when config.json does not exist.
    let page = await launch({ about: true });
    await page.evaluate(() =>
      localStorage.setItem('framenote.export-quality', '75'),
    );
    await stop();
    await rm(file);
    page = await launch();
    expect(await read()).toMatchObject({
      exportQuality: 75,
      rememberWindow: false,
    });
    await page.evaluate(() =>
      window.frameNoteDesktop.writeConfiguration({
        removeMetadata: false,
        checkUpdatesAtStartup: false,
      }),
    );
    await openSettings();
    const dialog = page.getByRole('dialog', { name: 'Settings' });
    const input = page.getByRole('spinbutton', {
      name: 'Undo steps per photo',
    });
    const rememberWindow = page.getByRole('switch', {
      name: 'Remember window position and size',
    });
    await expect(rememberWindow).toHaveAttribute('aria-checked', 'false');
    await rememberWindow.click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await openSettings();
    await expect(rememberWindow).toHaveAttribute('aria-checked', 'true');
    await expect(input).toHaveValue('100');
    await input.fill('7');
    await page
      .getByRole('button', { name: 'Close Settings', exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    await openSettings();
    await expect(input).toHaveValue('100');
    await input.fill('7');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await openSettings();
    await expect(input).toHaveValue('100');
    await page.mouse.click(1, 1);
    await expect(dialog).toBeVisible();
    await input.fill('1.5');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Enter a whole number' }),
    ).toBeVisible();
    await input.fill('8');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect((await read()).historyLimit).toBe(8);
    await openSettings();
    await expect(input).toHaveValue('8');
    await page.getByRole('button', { name: 'Restore defaults' }).click();
    await expect(input).toHaveValue('100');
    await expect(
      page.getByRole('switch', { name: 'Remember window position and size' }),
    ).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect((await read()).historyLimit).toBe(8);
    // File reveal is fixed to the app-owned config path.
    await app.evaluate(({ shell }) => {
      globalThis.revealedConfig = '';
      shell.showItemInFolder = (path) => {
        globalThis.revealedConfig = path;
      };
    });
    await openSettings();
    await page.getByRole('button', { name: 'Show configuration file' }).click();
    expect(await app.evaluate(() => globalThis.revealedConfig)).toBe(file);
    await page.keyboard.press('Escape');
    // Failed Save leaves the draft open and does not apply a new history limit.
    const source = await readFile(file, 'utf8');
    await rm(file);
    await mkdir(file);
    await openSettings();
    await input.fill('3');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText(
      'Could not save settings',
    );
    await expect(dialog).toBeVisible();
    await rm(file, { recursive: true });
    await writeFile(file, source);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await openSettings();
    await expect(input).toHaveValue('8');
    await page.keyboard.press('Escape');
    const add = page.getByRole('button', { name: 'Add layer', exact: true });
    const layers = page.locator(
      '[data-section="containers"] [data-picker-row]',
    );
    const original = await layers.count();
    await add.click();
    await add.click();
    await expect(layers).toHaveCount(original + 2);
    await openSettings();
    await input.fill('1');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    // Save applies the cap to already existing history, while settings edits don't add editor steps.
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(layers).toHaveCount(original + 1);
    await expect(
      page.getByRole('button', { name: 'Undo', exact: true }),
    ).toBeDisabled();
    if (process.platform === 'darwin') {
      // CDP keyboard events bypass Electron's native accelerator processing.
      await app.evaluate(({ BrowserWindow }) => {
        const contents = BrowserWindow.getAllWindows()[0].webContents;
        contents.sendInputEvent({
          type: 'keyDown',
          keyCode: ',',
          modifiers: ['meta'],
        });
        contents.sendInputEvent({
          type: 'keyUp',
          keyCode: ',',
          modifiers: ['meta'],
        });
      });
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
    }
    // Pending external edits are not reloaded by opening Settings.
    const external = {
      ...(await read()),
      future: { nested: [true, { mode: 'next' }] },
      window: {
        x: 0,
        y: 0,
        width: 1000,
        height: 700,
        displayId: await app.evaluate(
          ({ screen }) => screen.getPrimaryDisplay().id,
        ),
        maximized: false,
        ...(await read()).window,
        future: { scale: 2 },
      },
      historyLimit: 42,
      exportQuality: 60,
      removeMetadata: false,
      checkUpdatesAtStartup: false,
    };
    await writeFile(file, JSON.stringify(external));
    await openSettings();
    await expect(input).toHaveValue('1');
    await page.keyboard.press('Escape');
    await stop();
    // Close writes the in-memory configuration (last save wins), so edit after closing for restart.
    await writeFile(file, JSON.stringify(external));
    page = await launch();
    await openSettings();
    await expect(
      page.getByRole('spinbutton', { name: 'Undo steps per photo' }),
    ).toHaveValue('42');
    expect(
      (await page.evaluate(() => window.frameNoteDesktop.readConfiguration(95)))
        .config,
    ).toMatchObject({ exportQuality: 60, removeMetadata: false });
    await page.keyboard.press('Escape');
    // Manual update checking remains available with startup checking disabled.
    await app.evaluate(() => {
      globalThis.updateRequests = 0;
      // Exercise transport counting using this local stub, never the network.
      globalThis.fetch = async () => {
        globalThis.updateRequests++;
        return {
          ok: true,
          text: async () => '<feed xmlns="http://www.w3.org/2005/Atom"/>',
        };
      };
    });
    await app.evaluate(() => {
      process.env.FRAMENOTE_TEST_UPDATE_FEED = '0';
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(await app.evaluate(() => globalThis.updateRequests)).toBe(0);
    await app.evaluate(({ Menu }) =>
      Menu.getApplicationMenu()
        .items[0].submenu.items.find(
          (item) => item.label === 'Check for Updates…',
        )
        .click(),
    );
    await expect
      .poll(() => app.evaluate(() => globalThis.updateRequests))
      .toBe(1);
    await page.locator('[data-section="export"] > summary').click();
    await expect(
      page.getByRole('slider', { name: 'JPEG quality', exact: true }),
    ).toHaveAttribute('aria-valuenow', '60');
    await expect(
      page.getByRole('switch', { name: 'Remove all metadata' }),
    ).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('radio', { name: 'Balanced', exact: true }).click();
    await page.getByRole('switch', { name: 'Remove all metadata' }).click();
    await expect
      .poll(async () => ({
        quality: (await read()).exportQuality,
        remove: (await read()).removeMetadata,
      }))
      .toEqual({ quality: 75, remove: true });
    // Normal geometry persists and restores, then disabled remembering ignores old geometry.
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].setBounds({
        x: 60,
        y: 80,
        width: 1000,
        height: 700,
      }),
    );
    expect(await read()).toMatchObject({
      future: external.future,
      window: { future: { scale: 2 } },
    });
    const normal = await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getBounds(),
    );
    await stop();
    page = await launch();
    expect(
      await app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].getBounds(),
      ),
    ).toEqual(normal);
    expect(await read()).toMatchObject({
      exportQuality: 75,
      removeMetadata: true,
    });
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].maximize(),
    );
    await expect
      .poll(() =>
        app.evaluate(({ BrowserWindow }) =>
          BrowserWindow.getAllWindows()[0].isMaximized(),
        ),
      )
      .toBe(true);
    await stop();
    page = await launch();
    await expect
      .poll(() =>
        app.evaluate(({ BrowserWindow }) =>
          BrowserWindow.getAllWindows()[0].isMaximized(),
        ),
      )
      .toBe(false);
    await page.evaluate(() =>
      window.frameNoteDesktop.writeConfiguration({ rememberWindow: false }),
    );
    await stop();
    page = await launch();
    const defaultBounds = await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getBounds(),
    );
    expect(defaultBounds).not.toEqual(normal);
    await stop();
    // Invalid and newer files survive startup and automatic writes unchanged.
    for (const source of ['broken JSON', '{"version":2,"custom":true}']) {
      await writeFile(file, source);
      page = await launch();
      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: 'Configuration could not be loaded' }),
      ).toBeVisible();
      // Simultaneous startup warning and update use one stack below native chrome.
      await app.evaluate(({ ipcMain }) => {
        ipcMain.removeHandler('updates-check');
        ipcMain.handle('updates-check', () => ({
          status: 'available',
          release: {
            version: '99.0.0',
            url: 'https://github.com/rafalkarczmarzyk/frame-note/releases/tag/v99.0.0',
          },
        }));
      });
      await page.evaluate(() =>
        window.dispatchEvent(new Event('framenote-check-updates')),
      );
      const stack = page.locator('[data-app-notifications]');
      await expect(stack.getByRole('status')).toContainText('99.0.0');
      const notification = stack.getByRole('alert');
      for (const width of [800, 1440]) {
        await app.evaluate(
          ({ BrowserWindow }, width) =>
            BrowserWindow.getAllWindows()[0].setSize(width, 900),
          width,
        );
        await expect.poll(() => page.evaluate(() => innerWidth)).toBe(width);
        const title = await page
          .locator('[data-window-titlebar]')
          .boundingBox();
        const header = await page
          .locator('header[data-platform]')
          .boundingBox();
        const warning = await notification.boundingBox();
        const update = await stack.getByRole('status').boundingBox();
        expect(title.y).toBe(0);
        expect(warning.y).toBeGreaterThanOrEqual(header.y + header.height);
        expect(update.y).toBeGreaterThan(warning.y + warning.height);
        expect(warning.x).toBeGreaterThanOrEqual(0);
        expect(warning.x + warning.width).toBeLessThanOrEqual(width);
        if (source === 'broken JSON')
          await page.screenshot({
            path: join(tmpdir(), `framenote-notification-stack-${width}.png`),
          });
      }
      await page
        .getByRole('button', { name: 'Open Settings', exact: true })
        .click();
      await expect(
        page.getByRole('dialog', { name: 'Settings' }),
      ).toContainText('original file has been preserved');
      await expect(
        page.getByRole('spinbutton', { name: 'Undo steps per photo' }),
      ).toHaveValue('100');
      if (source === 'broken JSON') {
        await app.evaluate(({ dialog }) => {
          dialog.showMessageBox = async () => ({ response: 0 });
        });
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
        expect(await readFile(file, 'utf8')).toBe(source);
        await app.evaluate(({ dialog }) => {
          dialog.showMessageBox = async () => ({ response: 1 });
        });
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
        const backup = (await readdir(directory)).find((name) =>
          name.endsWith('.backup'),
        );
        expect(await readFile(join(directory, backup), 'utf8')).toBe(source);
      } else {
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
        await page.keyboard.press('Escape');
      }
      if (await notification.count()) {
        await page
          .getByRole('button', { name: 'Dismiss configuration notification' })
          .click();
      }
      await expect(notification).toHaveCount(0);
      await expect(stack.getByRole('status')).toContainText('99.0.0');
      await page
        .getByRole('button', { name: 'Dismiss update notification' })
        .click();
      await expect(stack.getByRole('status')).toHaveCount(0);
      await stop();
      if (source.includes('version'))
        expect(await readFile(file, 'utf8')).toBe(source);
    }
    // A different product version shows About once; manual opening still works.
    page = await launch();
    await page.evaluate(() =>
      localStorage.setItem('framenote.about-shown-version', '0.0.1-alpha'),
    );
    await stop();
    page = await launch({ about: true });
    await app.evaluate(({ Menu }) =>
      Menu.getApplicationMenu()
        .items[0].submenu.items.find((item) => item.label === 'About FrameNote')
        .click(),
    );
    await expect(
      page.getByRole('button', { name: 'Close about FrameNote', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Close about FrameNote', exact: true }),
    ).toHaveCount(0);
    await stop();
    page = await launch();
    await stop();
    console.log(
      'Desktop configuration: migration, Settings, persistence, errors, recovery and geometry passed.',
    );
  } finally {
    await stop();
    await rm(root, { recursive: true, force: true });
  }
}
