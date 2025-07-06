const { contextBridge, ipcRenderer } = require('electron')

// 暴露 Electron API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // 监听窗口状态
  onMaximize: (callback) => ipcRenderer.on('window-maximized', callback),
  onUnmaximize: (callback) => ipcRenderer.on('window-unmaximized', callback),
  
  // 文件系统操作
  selectDirectory: () => ipcRenderer.invoke('select-directory')
})
