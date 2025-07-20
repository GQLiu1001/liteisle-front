// 补丁：在你现有的preload.js中添加以下内容

const { contextBridge, ipcRenderer } = require('electron')

// 如果你已经有electronAPI，则添加到现有对象中
// 如果没有，则创建新的electronAPI对象

contextBridge.exposeInMainWorld('electronAPI', {
  // 你现有的方法...
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // 添加缺失的方法：
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  testPicGo: (data) => ipcRenderer.invoke('test-picgo', data),
  uploadToPicGo: (data) => ipcRenderer.invoke('upload-to-picgo', data)
}) 