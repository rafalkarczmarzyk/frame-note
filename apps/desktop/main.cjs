const {
  app,
  BrowserWindow,
  protocol,
  net,
  session,
  dialog,
  Menu,
  ipcMain,
  shell,
  screen,
} = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const { execFile } = require('node:child_process');
const runFile = require('node:util').promisify(execFile);
const { requestUpdate } = require('./update-check.cjs');
const { restoreWindowGeometry } = require('./window-geometry.cjs');
let systemFonts;
app.setName('FrameNote');
const profile = app.commandLine.getSwitchValue('user-data-dir');
const userData = profile || path.join(app.getPath('appData'), 'FrameNote');
fs.mkdirSync(userData, { recursive: true });
app.setPath('userData', userData);
const { PresetFiles, ConfigFile } = require('./preset-files.cjs');
const dataDirectory = profile
  ? path.join(userData, 'FrameNote')
  : path.join(app.getPath('home'), 'FrameNote');
const presetFiles = new PresetFiles(dataDirectory);
const configuration = new ConfigFile(dataDirectory);
let configurationInitialized = false;
const rendererRoot = path.join(__dirname, 'renderer');
// Only the local development launcher may replace bundled renderer resources.
const devServerUrl = !app.isPackaged && process.env.FRAMENOTE_DEV_SERVER_URL;
if (devServerUrl && !/^http:\/\/127\.0\.0\.1:[0-9]{1,5}\/$/u.test(devServerUrl))
  throw new Error(
    'Desktop live preview requires a loopback development server.',
  );
const rendererUrl = devServerUrl || 'framenote://app/';
const rendererOrigin = rendererUrl.slice(0, -1);
const isRendererUrl = (url) => url.startsWith(rendererUrl);
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'framenote',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
let window;
function trusted(event) {
  return (
    event.sender === window?.webContents &&
    event.senderFrame === window.webContents.mainFrame &&
    isRendererUrl(event.senderFrame.url)
  );
}
app.whenReady().then(async () => {
  await configuration.load();
  ipcMain.handle('configuration-read', async (event, quality) => {
    if (!trusted(event)) throw Error('Untrusted configuration request.');
    const result = await configuration.initialize(quality);
    configurationInitialized = true;
    return result;
  });
  ipcMain.handle('configuration-write', async (event, patch, settingsSave) => {
    if (
      !trusted(event) ||
      !patch ||
      typeof patch !== 'object' ||
      Object.keys(patch).some(
        (key) =>
          ![
            'exportQuality',
            'removeMetadata',
            'historyLimit',
            'rememberWindow',
            'checkUpdatesAtStartup',
          ].includes(key),
      )
    )
      throw Error('Invalid configuration request.');
    let replace = false;
    if (configuration.canReplace() && settingsSave === true) {
      const result = await dialog.showMessageBox(window, {
        type: 'warning',
        title: 'Replace invalid configuration?',
        message: 'Back up and replace the invalid configuration file?',
        detail:
          'The original will be kept beside config.json as a backup. Your current settings will be saved in a new configuration file.',
        buttons: ['Cancel', 'Back up and replace'],
        defaultId: 0,
        cancelId: 0,
      });
      if (result.response !== 1)
        throw Error('Configuration replacement cancelled.');
      replace = true;
    }
    const result = await configuration.update(patch, replace);
    configurationInitialized = true;
    return result;
  });
  ipcMain.handle('configuration-reveal', (event) => {
    if (!trusted(event)) throw Error('Untrusted configuration request.');
    shell.showItemInFolder(configuration.file);
  });
  if (process.platform === 'darwin' && !app.isPackaged)
    app.dock.setIcon(
      path.resolve(
        __dirname,
        '../../packages/editor/src/assets/graphics/framenote-app-icon.png',
      ),
    );
  protocol.handle('framenote', (request) => {
    const url = new URL(request.url);
    const file = path.resolve(
      rendererRoot,
      '.' +
        decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname),
    );
    if (url.host !== 'app' || !file.startsWith(rendererRoot + path.sep))
      return new Response('', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  session.defaultSession.setPermissionRequestHandler(
    (contents, permission, callback, details) =>
      callback(
        permission === 'local-fonts' &&
          contents === window?.webContents &&
          details.isMainFrame &&
          isRendererUrl(details.requestingUrl),
      ),
  );
  session.defaultSession.setPermissionCheckHandler(
    (contents, permission, origin) =>
      permission === 'local-fonts' &&
      contents === window?.webContents &&
      origin === rendererOrigin,
  );
  const contentSecurityPolicy = devServerUrl
    ? `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob: ${rendererOrigin.replace('http:', 'ws:')}; object-src 'none'; base-uri 'none'`
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'";
  session.defaultSession.webRequest.onHeadersReceived((details, callback) =>
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [contentSecurityPolicy],
      },
    }),
  );
  ipcMain.on('history-menu-state', (event, state) => {
    if (
      !trusted(event) ||
      !state ||
      typeof state.canUndo !== 'boolean' ||
      typeof state.canRedo !== 'boolean'
    )
      return;
    const menu = Menu.getApplicationMenu();
    for (const [direction, enabled, label] of [
      ['undo', state.canUndo, state.undoLabel],
      ['redo', state.canRedo, state.redoLabel],
    ]) {
      const item = menu?.getMenuItemById(`edit-${direction}`);
      if (!item) continue;
      item.enabled = enabled;
      item.label = `${direction === 'undo' ? 'Undo' : 'Redo'}${typeof label === 'string' ? ` ${label.slice(0, 80)}` : ''}`;
    }
    const alternate = menu?.getMenuItemById('edit-redo-alternate');
    if (alternate) alternate.enabled = state.canRedo;
  });
  ipcMain.handle('presets-read', (event) => {
    if (!trusted(event)) throw Error('Untrusted preset request.');
    return presetFiles.read();
  });
  ipcMain.handle('updates-check', async (event) => {
    if (!trusted(event)) throw Error('Untrusted update request.');
    return requestUpdate(app.getVersion());
  });
  ipcMain.handle('updates-open-release', (event, url) => {
    if (
      !trusted(event) ||
      typeof url !== 'string' ||
      !/^https:\/\/github\.com\/rafalkarczmarzyk\/frame-note\/releases\/tag\/[\w.-]+$/u.test(
        url,
      )
    )
      throw Error('Invalid release URL.');
    return shell.openExternal(url);
  });
  ipcMain.handle('system-fonts-read', async (event) => {
    if (!trusted(event)) throw Error('Untrusted font request.');
    if (process.platform === 'darwin') {
      systemFonts ??= runFile(
        '/usr/bin/osascript',
        [
          '-l',
          'JavaScript',
          '-e',
          `
        ObjC.import('AppKit');
        var manager = $.NSFontManager.sharedFontManager;
        var result = [];
        ObjC.deepUnwrap(manager.availableFontFamilies).forEach(function(family) {
          (ObjC.deepUnwrap(manager.availableMembersOfFontFamily(family)) || []).forEach(function(member) {
            result.push({ family: family, postscriptName: member[0], style: member[1],
              nativeWeight: member[2], bold: !!(member[3] & 2), italic: !!(member[3] & 1) });
          });
        });
        JSON.stringify(result);
      `,
        ],
        { timeout: 15000, maxBuffer: 5 * 1024 * 1024 },
      ).then(({ stdout }) => JSON.parse(stdout));
      return systemFonts;
    }
    return window.webContents.executeJavaScript(
      `window.queryLocalFonts().then(fonts => fonts.map(({ family, style, postscriptName }) => ({ family, style, postscriptName })))`,
      true,
    );
  });
  ipcMain.handle('presets-write', (event, source, touchedIds) => {
    if (
      !trusted(event) ||
      typeof source !== 'string' ||
      source.length > 100_000_000 ||
      (touchedIds !== undefined &&
        (!Array.isArray(touchedIds) ||
          touchedIds.length > 10000 ||
          touchedIds.some(
            (id) =>
              typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/u.test(id),
          )))
    )
      throw Error('Invalid preset request.');
    return presetFiles.write(source, touchedIds);
  });
  ipcMain.handle('save-output', async (event, name, bytes) => {
    if (
      !trusted(event) ||
      typeof name !== 'string' ||
      name.length > 240 ||
      path.basename(name) !== name ||
      !(bytes instanceof Uint8Array) ||
      bytes.byteLength > 1_000_000_000
    )
      throw new Error('Invalid output request');
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      title: 'Save FrameNote output',
      defaultPath: name,
    });
    if (canceled || !filePath) return 'cancelled';
    const temporary =
      filePath + '.framenote-' + require('node:crypto').randomUUID() + '.tmp';
    try {
      await fs.promises.writeFile(temporary, bytes, { flag: 'wx' });
      await fs.promises.rename(temporary, filePath);
      return 'saved';
    } finally {
      await fs.promises.rm(temporary, { force: true }).catch(() => {});
    }
  });
  const { workArea } = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint(),
  );
  const width = Math.min(2240, workArea.width);
  const height = Math.min(1560, workArea.height);
  const startupConfig = configuration.snapshot().config;
  const geometry = restoreWindowGeometry(
    startupConfig.rememberWindow ? startupConfig.window : undefined,
    screen.getAllDisplays(),
    screen.getPrimaryDisplay(),
    {
      width,
      height,
      x: workArea.x + Math.floor((workArea.width - width) / 2),
      y: workArea.y + Math.floor((workArea.height - height) / 2),
    },
  );
  window = new BrowserWindow({
    ...geometry,
    minWidth: Math.min(800, geometry.width),
    minHeight: Math.min(600, geometry.height),
    title: 'FrameNote',
    show: false,
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  window.once('ready-to-show', () => {
    if (startupConfig.rememberWindow && startupConfig.window?.maximized)
      window.maximize();
    window.show();
  });
  let geometryTimer;
  let closing = false;
  const saveGeometry = () => {
    if (
      !configurationInitialized ||
      !configuration.snapshot().config.rememberWindow ||
      window.isFullScreen() ||
      window.isMinimized()
    )
      return Promise.resolve();
    const bounds = window.getNormalBounds();
    return configuration
      .update({
        window: {
          ...bounds,
          displayId: screen.getDisplayMatching(bounds).id,
          maximized: window.isMaximized(),
        },
      })
      .catch(() => {
        /* Invalid source is preserved; renderer reports configuration errors. */
      });
  };
  for (const name of ['resize', 'move', 'maximize', 'unmaximize'])
    window.on(name, () => {
      clearTimeout(geometryTimer);
      geometryTimer = setTimeout(() => {
        void saveGeometry();
      }, 300);
    });
  window.on('close', (event) => {
    clearTimeout(geometryTimer);
    if (closing) return;
    event.preventDefault();
    closing = true;
    void saveGeometry().finally(() => window.close());
  });
  const openProjectLink = (url) => {
    if (
      url === 'https://github.com/rafalkarczmarzyk/frame-note' ||
      url ===
        'https://github.com/rafalkarczmarzyk/frame-note/blob/master/CHANGELOG.md' ||
      /^https:\/\/github\.com\/rafalkarczmarzyk\/frame-note\/releases\/tag\/[\w.-]+$/u.test(
        url,
      )
    )
      void shell.openExternal(url);
  };
  window.webContents.setWindowOpenHandler(({ url }) => {
    openProjectLink(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (!isRendererUrl(url)) event.preventDefault();
  });
  session.defaultSession.on('will-download', (_event, item) => {
    item.setSaveDialogOptions({
      title: 'Save FrameNote output',
      defaultPath: item.getFilename(),
    });
    item.once('done', (_event, state) => {
      if (state === 'interrupted')
        dialog.showErrorBox(
          'Could not save output',
          'The file could not be saved. Try exporting again.',
        );
    });
  });
  const command = (name) => window?.webContents.send('menu-command', name);
  // Handle the standard preferences shortcut before renderer text/edit handlers.
  window.webContents.on('before-input-event', (event, input) => {
    if (
      process.platform === 'darwin' &&
      input.type === 'keyDown' &&
      input.meta &&
      !input.control &&
      !input.alt &&
      !input.shift &&
      input.key === ','
    ) {
      event.preventDefault();
      command('settings');
    }
  });
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { label: 'About FrameNote', click: () => command('about') },
          {
            id: 'app-settings',
            label: 'Settings…',
            ...(process.platform === 'darwin' ? { accelerator: 'Cmd+,' } : {}),
            click: () => command('settings'),
          },
          {
            label: 'Check for Updates…',
            click: () => command('check-updates'),
          },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'Open photos…',
            accelerator: 'CmdOrCtrl+O',
            click: () => command('open'),
          },
          {
            label: 'Export JPG…',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => command('export'),
          },
          { type: 'separator' },
          { role: 'close' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            id: 'edit-undo',
            label: 'Undo',
            enabled: false,
            accelerator: 'CmdOrCtrl+Z',
            click: () => command('undo'),
          },
          {
            id: 'edit-redo',
            label: 'Redo',
            enabled: false,
            accelerator: 'CmdOrCtrl+Shift+Z',
            click: () => command('redo'),
          },
          ...(process.platform === 'darwin'
            ? []
            : [
                {
                  id: 'edit-redo-alternate',
                  enabled: false,
                  label: 'Redo',
                  visible: false,
                  accelerator: 'Ctrl+Y',
                  click: () => command('redo'),
                },
              ]),
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          { role: 'togglefullscreen' },
          { type: 'separator' },
          { role: 'front' },
        ],
      },
    ]),
  );
  await window.loadURL(rendererUrl);
});
app.on('window-all-closed', () => app.quit());

// Packaged apps and built previews always load bundled renderer resources.
if (!devServerUrl && !fs.existsSync(rendererRoot))
  throw new Error('Build the web renderer before starting desktop.');
