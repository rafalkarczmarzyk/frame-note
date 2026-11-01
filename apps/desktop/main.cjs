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
let systemFonts;
app.setName('FrameNote');
const profile = app.commandLine.getSwitchValue('user-data-dir');
const userData = profile || path.join(app.getPath('appData'), 'FrameNote');
fs.mkdirSync(userData, { recursive: true });
app.setPath('userData', userData);
const { PresetFiles } = require('./preset-files.cjs');
const dataDirectory = profile
  ? path.join(userData, 'FrameNote')
  : path.join(app.getPath('home'), 'FrameNote');
const presetFiles = new PresetFiles(dataDirectory);
const rendererRoot = path.join(__dirname, 'renderer');
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'framenote',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
let window;
let hasWork = false;
function trusted(event) {
  return (
    event.sender === window?.webContents &&
    event.senderFrame === window.webContents.mainFrame &&
    event.senderFrame.url.startsWith('framenote://app/')
  );
}
app.whenReady().then(async () => {
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
          details.requestingUrl.startsWith('framenote://app/'),
      ),
  );
  session.defaultSession.setPermissionCheckHandler(
    (contents, permission, origin) =>
      permission === 'local-fonts' &&
      contents === window?.webContents &&
      origin === 'framenote://app',
  );
  session.defaultSession.webRequest.onHeadersReceived((details, callback) =>
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'",
        ],
      },
    }),
  );
  ipcMain.on('session-state', (event, value) => {
    if (trusted(event) && typeof value === 'boolean') hasWork = value;
  });
  ipcMain.handle('presets-read', (event) => {
    if (!trusted(event)) throw Error('Untrusted preset request.');
    return presetFiles.read();
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
  window = new BrowserWindow({
    width,
    height,
    x: workArea.x + Math.floor((workArea.width - width) / 2),
    y: workArea.y + Math.floor((workArea.height - height) / 2),
    minWidth: Math.min(800, width),
    minHeight: Math.min(600, height),
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
  window.once('ready-to-show', () => window.show());
  const openProjectLink = (url) => {
    if (
      url === 'https://github.com/rafalkarczmarzyk/frame-note' ||
      url ===
        'https://github.com/rafalkarczmarzyk/frame-note/blob/master/CHANGELOG.md'
    )
      void shell.openExternal(url);
  };
  window.webContents.setWindowOpenHandler(({ url }) => {
    openProjectLink(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('framenote://app/')) event.preventDefault();
  });
  window.on('close', (event) => {
    if (hasWork) {
      const result = dialog.showMessageBoxSync(window, {
        type: 'question',
        buttons: ['Keep editing', 'Discard and close'],
        defaultId: 0,
        cancelId: 0,
        message: 'Close FrameNote and discard this session?',
        detail:
          'Unsaved layouts and open photos will be closed. Saved presets and source files are kept.',
      });
      if (result !== 1) event.preventDefault();
    }
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
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { label: 'About FrameNote', click: () => command('about') },
          { type: 'separator' },
          { role: 'services' },
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
      { role: 'editMenu' },
      { role: 'windowMenu' },
    ]),
  );
  await window.loadURL('framenote://app/');
});
app.on('window-all-closed', () => app.quit());

// Keep renderer resources inside the packaged application, never a remote URL.
if (!fs.existsSync(rendererRoot))
  throw new Error('Build the web renderer before starting desktop.');
