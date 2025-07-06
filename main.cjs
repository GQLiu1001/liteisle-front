const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'

// 设置应用数据目录
const userDataPath = path.join(app.getPath('appData'), 'liteisle-desktop')
app.setPath('userData', userDataPath)

// 确保目录存在
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true })
}

let mainWindow

// 清理缓存目录
function clearCache() {
  if (mainWindow) {
    const session = mainWindow.webContents.session
    session.clearCache().then(() => {
      console.log('Cache cleared successfully')
    }).catch(err => {
      console.error('Failed to clear cache:', err)
    })
  }
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,  // 增加最小宽度，避免与 lg 断点(1024px)冲突
    minHeight: 800,  // 适当增加最小高度
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      preload: preloadPath
    },
    show: false,
    frame: false,  // 移除原生窗口边框
    titleBarStyle: 'hidden'  // 隐藏标题栏
  })

  // 在窗口创建后清理缓存
  clearCache()

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // 当窗口准备好时显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 开发环境下自动最大化
    if (isDev) {
      mainWindow.maximize()
    }
  })

  // 监听窗口状态变化
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow()

  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，通常会重新创建一个窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 当所有窗口都关闭时退出应用 (macOS 除外)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 设置应用菜单为空，避免默认菜单
Menu.setApplicationMenu(null)

// IPC 事件处理 - 窗口控制
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
})

// 目录选择对话框
ipcMain.handle('select-directory', async () => {
  try {
    if (mainWindow) {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: '选择下载目录'
      })
      return result
    } else {
      return { canceled: true }
    }
  } catch (error) {
    return { canceled: true, error: error.message }
  }
}) 