const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

// 主窗口引用
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadFile('dist/index.html')
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// =============================================================================
// PicGo 集成 API 实现
// =============================================================================

// 1. 文件选择 API
ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options?.filters || [
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  console.log('文件选择结果:', result)
  return result
})

// 2. 目录选择 API
ipcMain.handle('select-directory', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  
  console.log('目录选择结果:', result)
  return result
})

// 3. PicGo 测试 API
ipcMain.handle('test-picgo', async (event, { picgoPath }) => {
  console.log('测试PicGo:', picgoPath)
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(picgoPath)) {
      return {
        success: false,
        error: '指定的PicGo路径不存在'
      }
    }

    // 尝试获取PicGo版本
    return new Promise((resolve) => {
      const picgo = spawn(picgoPath, ['--version'])
      
      let output = ''
      let errorOutput = ''
      
      picgo.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      picgo.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      picgo.on('close', (code) => {
        console.log(`PicGo测试完成，退出码: ${code}`)
        console.log('输出:', output)
        console.log('错误输出:', errorOutput)
        
        if (code === 0) {
          resolve({
            success: true,
            version: output.trim()
          })
        } else {
          resolve({
            success: false,
            error: errorOutput || '无法获取PicGo版本信息，可能是版本过旧或路径错误'
          })
        }
      })
      
      picgo.on('error', (err) => {
        console.error('启动PicGo时出错:', err)
        resolve({
          success: false,
          error: `无法启动PicGo: ${err.message}`
        })
      })
      
      // 设置超时
      setTimeout(() => {
        picgo.kill()
        resolve({
          success: false,
          error: '测试超时，PicGo可能无法正常启动'
        })
      }, 10000) // 10秒超时
    })
  } catch (error) {
    console.error('PicGo测试异常:', error)
    return {
      success: false,
      error: `测试PicGo时发生异常: ${error.message}`
    }
  }
})

// 4. PicGo 上传 API
ipcMain.handle('upload-to-picgo', async (event, { picgoPath, imageData, fileName }) => {
  console.log('开始PicGo上传:', { picgoPath, fileName, dataSize: imageData.length })
  
  try {
    // 检查PicGo路径
    if (!fs.existsSync(picgoPath)) {
      return {
        success: false,
        error: '指定的PicGo路径不存在'
      }
    }

    // 创建临时文件
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `picgo_upload_${Date.now()}_${fileName}`)
    
    console.log('创建临时文件:', tempFilePath)
    
    // 将图片数据写入临时文件
    const buffer = Buffer.from(imageData)
    fs.writeFileSync(tempFilePath, buffer)
    
    // 调用PicGo命令行上传
    return new Promise((resolve) => {
      const picgo = spawn(picgoPath, ['upload', tempFilePath])
      
      let output = ''
      let errorOutput = ''
      
      picgo.stdout.on('data', (data) => {
        const text = data.toString()
        output += text
        console.log('PicGo输出:', text)
      })
      
      picgo.stderr.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        console.log('PicGo错误:', text)
      })
      
      picgo.on('close', (code) => {
        console.log(`PicGo上传完成，退出码: ${code}`)
        console.log('完整输出:', output)
        console.log('完整错误输出:', errorOutput)
        
        // 清理临时文件
        try {
          fs.unlinkSync(tempFilePath)
          console.log('临时文件已删除:', tempFilePath)
        } catch (err) {
          console.warn('删除临时文件失败:', err)
        }
        
        if (code === 0) {
          // 尝试从输出中提取图片URL
          const urlMatches = output.match(/https?:\/\/[^\s\n\r]+/g)
          if (urlMatches && urlMatches.length > 0) {
            const imageUrl = urlMatches[urlMatches.length - 1] // 取最后一个URL
            console.log('提取到的图片URL:', imageUrl)
            resolve({
              success: true,
              url: imageUrl
            })
          } else {
            // 如果没有找到URL，但退出码是0，说明可能输出格式不同
            console.warn('未能从输出中提取URL，但上传似乎成功了')
            resolve({
              success: false,
              error: '上传完成但无法获取图片URL，请检查PicGo配置'
            })
          }
        } else {
          resolve({
            success: false,
            error: errorOutput || `PicGo上传失败 (退出码: ${code})`
          })
        }
      })
      
      picgo.on('error', (err) => {
        console.error('启动PicGo上传时出错:', err)
        
        // 清理临时文件
        try {
          fs.unlinkSync(tempFilePath)
        } catch (cleanupErr) {
          console.warn('删除临时文件失败:', cleanupErr)
        }
        
        resolve({
          success: false,
          error: `无法启动PicGo上传: ${err.message}`
        })
      })
      
      // 设置上传超时
      setTimeout(() => {
        picgo.kill()
        
        // 清理临时文件
        try {
          fs.unlinkSync(tempFilePath)
        } catch (err) {
          console.warn('删除临时文件失败:', err)
        }
        
        resolve({
          success: false,
          error: '上传超时，请检查网络连接和PicGo配置'
        })
      }, 60000) // 60秒超时
    })
  } catch (error) {
    console.error('PicGo上传异常:', error)
    return {
      success: false,
      error: `上传过程中发生异常: ${error.message}`
    }
  }
})

// =============================================================================
// 调试和日志
// =============================================================================

// 打印启动信息
console.log('Electron主进程启动完成')
console.log('PicGo集成API已注册:')
console.log('- select-file: 文件选择')
console.log('- select-directory: 目录选择') 
console.log('- test-picgo: PicGo测试')
console.log('- upload-to-picgo: PicGo上传')

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
}) 