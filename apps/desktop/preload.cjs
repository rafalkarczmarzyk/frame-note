const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('frameNoteDesktop', {
  platform: process.platform,
  readSystemFonts: () => ipcRenderer.invoke('system-fonts-read'),
  readPresets: () => ipcRenderer.invoke('presets-read'),
  writePresets: (source, touchedIds) =>
    ipcRenderer.invoke('presets-write', source, touchedIds),
  saveFile: (name, bytes) => ipcRenderer.invoke('save-output', name, bytes),
  checkUpdates: () => ipcRenderer.invoke('updates-check'),
  openRelease: (url) => ipcRenderer.invoke('updates-open-release', url),
  updateHistoryMenu: (state) => ipcRenderer.send('history-menu-state', state),
  onCommand: (callback) => {
    const listener = (_event, command) => {
      if (
        command === 'open' ||
        command === 'export' ||
        command === 'about' ||
        command === 'check-updates' ||
        command === 'undo' ||
        command === 'redo'
      )
        callback(command);
    };
    ipcRenderer.on('menu-command', listener);
    return () => ipcRenderer.removeListener('menu-command', listener);
  },
});
