const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('frameNoteDesktop', {
  platform: process.platform,
  saveFile: (name, bytes) => ipcRenderer.invoke('save-output', name, bytes),
  setSessionOpen: (value) => {
    if (typeof value === 'boolean') ipcRenderer.send('session-state', value);
  },
  onCommand: (callback) => {
    const listener = (_event, command) => {
      if (command === 'open' || command === 'export' || command === 'about')
        callback(command);
    };
    ipcRenderer.on('menu-command', listener);
    return () => ipcRenderer.removeListener('menu-command', listener);
  },
});
