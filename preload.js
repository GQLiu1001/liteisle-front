const { contextBridge, ipcRenderer } = require('electron')

// 暴露 Electron API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // 文件系统操作
  selectDirectory: () => ipcRenderer.invoke('select-directory')
})
