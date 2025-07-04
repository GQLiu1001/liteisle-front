const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  console.log('创建窗口...');
  console.log('当前目录:', __dirname);
  
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload 文件路径:', preloadPath);
  console.log('Preload 文件是否存在:', fs.existsSync(preloadPath));
  
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,  // 增加最小宽度，避免与 lg 断点(1024px)冲突
    minHeight: 700,  // 适当增加最小高度
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
  console.log('main: 收到 window-minimize 事件');
  if (mainWindow) {
    mainWindow.minimize();
    console.log('main: 窗口已最小化');
  } else {
    console.error('main: mainWindow 不存在');
  }
})

ipcMain.on('window-maximize', () => {
  console.log('main: 收到 window-maximize 事件');
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      console.log('main: 窗口已还原');
    } else {
      mainWindow.maximize();
      console.log('main: 窗口已最大化');
    }
  } else {
    console.error('main: mainWindow 不存在');
  }
})

ipcMain.on('window-close', () => {
  console.log('main: 收到 window-close 事件');
  if (mainWindow) {
    mainWindow.close();
    console.log('main: 窗口关闭请求已发送');
  } else {
    console.error('main: mainWindow 不存在');
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
      console.log('Directory selection result:', result)
      return result
    } else {
      console.error('Main window not available')
      return { canceled: true }
    }
  } catch (error) {
    console.error('Error in select-directory:', error)
    return { canceled: true, error: error.message }
  }
}) 