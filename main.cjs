const { app, BrowserWindow, Menu, ipcMain, dialog, Tray, nativeImage } = require('electron')
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
let tray = null

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

// 创建系统托盘
function createTray() {
  // 创建托盘图标 - 修复路径问题
  let iconPath
  if (isDev) {
    iconPath = path.join(__dirname, 'public/logopic.png')
  } else {
    // 生产环境下，图标文件应该在resources目录下
    iconPath = path.join(process.resourcesPath, 'logopic.png')
    // 如果上面的路径不存在，尝试其他可能的路径
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, 'public/logopic.png')
    }
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, '../public/logopic.png')
    }
  }
  
  console.log('托盘图标路径:', iconPath)
  console.log('图标文件是否存在:', fs.existsSync(iconPath))
  
  // 如果图标文件不存在，使用默认图标
  let trayIcon
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    console.log('成功加载托盘图标')
  } else {
    console.warn('托盘图标文件不存在，使用默认图标')
    // 创建一个简单的默认图标
    trayIcon = nativeImage.createEmpty()
  }
  
  tray = new Tray(trayIcon)
  
  // 设置托盘提示文本
  tray.setToolTip('Liteisle Desktop')
  
  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示应用',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          }
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '隐藏应用',
      click: () => {
        if (mainWindow) {
          mainWindow.hide()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出应用',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
  
  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.show()
      mainWindow.focus()
    }
  })
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

  // 创建系统托盘
  createTray()

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

  // 处理窗口关闭事件
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      // 发送关闭确认请求到渲染进程
      mainWindow.webContents.send('show-close-confirmation')
    }
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
  console.log('收到窗口最小化请求')
  if (mainWindow) {
    mainWindow.minimize();
    console.log('窗口最小化成功')
  } else {
    console.error('mainWindow 不存在')
  }
})

ipcMain.on('window-maximize', () => {
  console.log('收到窗口最大化/还原请求')
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      console.log('窗口还原成功')
    } else {
      mainWindow.maximize();
      console.log('窗口最大化成功')
    }
  } else {
    console.error('mainWindow 不存在')
  }
})

ipcMain.on('window-close', () => {
  console.log('收到窗口关闭请求')
  if (mainWindow) {
    // 不直接关闭，而是发送确认请求
    mainWindow.webContents.send('show-close-confirmation')
  } else {
    console.error('mainWindow 不存在')
  }
})

// 最小化到托盘
ipcMain.on('minimize-to-tray', () => {
  console.log('收到最小化到托盘请求')
  if (mainWindow) {
    mainWindow.hide()
    console.log('应用已最小化到系统托盘')
  }
})

// 真正退出应用
ipcMain.on('quit-app', () => {
  console.log('收到退出应用请求')
  app.isQuiting = true
  app.quit()
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