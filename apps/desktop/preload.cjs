const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('frameNoteDesktop', {
  setSessionOpen: (value) => {
    if (typeof value === 'boolean') ipcRenderer.send('session-state', value);
  },
  onCommand: (callback) => {
    const listener = (_event, command) => {
      if (command === 'open' || command === 'export') callback(command);
    };
    ipcRenderer.on('menu-command', listener);
    return () => ipcRenderer.removeListener('menu-command', listener);
  },
});
