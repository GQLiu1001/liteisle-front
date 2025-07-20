// 补丁：在你现有的主进程文件中添加以下内容

const { ipcMain, dialog } = require('electron')

// 1. 添加文件选择API（如果还没有的话）
ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: options?.filters || [
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
})

// 2. 添加PicGo测试API（简化版本）
ipcMain.handle('test-picgo', async (event, { picgoPath }) => {
  const fs = require('fs')
  
  // 简单检查文件是否存在
  if (fs.existsSync(picgoPath)) {
    return { success: true, version: 'File exists' }
  } else {
    return { success: false, error: '文件不存在' }
  }
})

// 3. 添加PicGo上传API（简化版本）
ipcMain.handle('upload-to-picgo', async (event, data) => {
  // 简化实现：只返回模拟成功
  return { 
    success: false, 
    error: '上传功能需要完整实现，请参考 electron-main-example.js' 
  }
}) 