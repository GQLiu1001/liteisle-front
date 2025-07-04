const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script 正在执行...');

// 暴露 Electron API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => {
    console.log('preload: minimizeWindow 被调用');
    ipcRenderer.send('window-minimize');
  },
  maximizeWindow: () => {
    console.log('preload: maximizeWindow 被调用');
    ipcRenderer.send('window-maximize');
  },
  closeWindow: () => {
    console.log('preload: closeWindow 被调用');
    ipcRenderer.send('window-close');
  },
  
  // 文件系统操作
  selectDirectory: () => {
    console.log('selectDirectory 被调用');
    return ipcRenderer.invoke('select-directory');
  },
  
  // 测试函数
  test: () => {
    console.log('electronAPI.test 被调用');
    return 'Electron API 工作正常!';
  }
})

console.log('Preload script 执行完成，electronAPI 已暴露');
