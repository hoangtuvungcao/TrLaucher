const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  launchMinecraft: (host, port) => ipcRenderer.invoke('launch-minecraft', { host, port }),
  isElectron: true
});
