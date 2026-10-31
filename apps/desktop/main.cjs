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
} = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
app.setName('FrameNote');
const profile = app.commandLine.getSwitchValue('user-data-dir');
const userData = profile || path.join(app.getPath('appData'), 'FrameNote');
fs.mkdirSync(userData, { recursive: true });
app.setPath('userData', userData);
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
    (_contents, _permission, callback) => callback(false),
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
  window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 800,
    minHeight: 600,
    title: 'FrameNote',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
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
      { role: 'appMenu' },
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
