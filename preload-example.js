const { contextBridge, ipcRenderer } = require('electron')

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件选择
  selectFile: (options) => {
    console.log('渲染进程调用selectFile:', options)
    return ipcRenderer.invoke('select-file', options)
  },
  
  // 目录选择
  selectDirectory: () => {
    console.log('渲染进程调用selectDirectory')
    return ipcRenderer.invoke('select-directory')
  },
  
  // PicGo测试
  testPicGo: (data) => {
    console.log('渲染进程调用testPicGo:', data)
    return ipcRenderer.invoke('test-picgo', data)
  },
  
  // PicGo上传
  uploadToPicGo: (data) => {
    console.log('渲染进程调用uploadToPicGo:', {
      picgoPath: data.picgoPath,
      fileName: data.fileName,
      dataSize: data.imageData?.length || 0
    })
    return ipcRenderer.invoke('upload-to-picgo', data)
  }
})

// 打印初始化信息
console.log('Preload脚本加载完成，已暴露electronAPI到window对象')
console.log('可用API:', Object.keys(window.electronAPI || {})) 