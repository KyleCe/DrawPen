console.log('[DRAWPEN]: Main page preloading...');

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer -> Main
  invokeHideApp: () => ipcRenderer.invoke('hide_app'),
  invokeGetSettings: () => ipcRenderer.invoke('get_settings'),
  invokeSetSettings: (settings) => ipcRenderer.invoke('set_settings', settings),
  invokeSetIgnoreMouseEvents: (ignore) => ipcRenderer.invoke('set_ignore_mouse_events', ignore),

  // Main -> Renderer
  onResetScreen: (callback) => ipcRenderer.on('reset_screen', callback),
  onToggleToolbar: (callback) => ipcRenderer.on('toggle_toolbar', callback),
  onToggleWhiteboard: (callback) => ipcRenderer.on('toggle_whiteboard', callback),
});
