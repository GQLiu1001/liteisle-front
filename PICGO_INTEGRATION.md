# PicGo 集成说明

本文档说明如何在 Electron 主进程中实现 PicGo 集成功能，以支持图片自动上传。

## 🚀 快速开始

### 1. 复制示例文件

我们提供了完整的示例文件：
- `electron-main-example.js` - 完整的主进程实现
- `preload-example.js` - preload脚本示例

### 2. 集成到你的项目

将示例代码复制到你的 Electron 项目中，确保：
- 主进程文件包含所有 PicGo API
- preload 脚本正确暴露 API
- 窗口配置正确设置 preload 路径

## 📋 所需的 Electron API 实现

需要在 Electron 主进程中实现以下 API：

### 1. 文件选择 API

```javascript
// 在 main.js 或相应的主进程文件中
const { dialog } = require('electron')

// 注册文件选择API
ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: options.filters || [
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
})
```

### 2. PicGo 上传 API

```javascript
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

// 注册PicGo上传API
ipcMain.handle('upload-to-picgo', async (event, { picgoPath, imageData, fileName }) => {
  try {
    // 创建临时文件
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, fileName)
    
    // 将图片数据写入临时文件
    const buffer = Buffer.from(imageData)
    fs.writeFileSync(tempFilePath, buffer)
    
    // 调用PicGo命令行上传
    return new Promise((resolve, reject) => {
      const picgo = spawn(picgoPath, ['upload', tempFilePath])
      
      let output = ''
      let errorOutput = ''
      
      picgo.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      picgo.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      picgo.on('close', (code) => {
        // 清理临时文件
        try {
          fs.unlinkSync(tempFilePath)
        } catch (err) {
          console.warn('Failed to delete temp file:', err)
        }
        
        if (code === 0) {
          // 解析输出获取图片URL
          const urlMatch = output.match(/https?:\/\/[^\s]+/g)
          if (urlMatch && urlMatch.length > 0) {
            resolve({
              success: true,
              url: urlMatch[urlMatch.length - 1] // 取最后一个URL
            })
          } else {
            resolve({
              success: false,
              error: '无法从PicGo输出中提取图片URL'
            })
          }
        } else {
          resolve({
            success: false,
            error: errorOutput || 'PicGo上传失败'
          })
        }
      })
      
      picgo.on('error', (err) => {
        // 清理临时文件
        try {
          fs.unlinkSync(tempFilePath)
        } catch (cleanupErr) {
          console.warn('Failed to delete temp file:', cleanupErr)
        }
        
        resolve({
          success: false,
          error: `无法启动PicGo: ${err.message}`
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: `创建临时文件失败: ${error.message}`
    }
  }
})
```

### 3. PicGo 测试 API

```javascript
// 注册PicGo测试API
ipcMain.handle('test-picgo', async (event, { picgoPath }) => {
  try {
    return new Promise((resolve, reject) => {
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
        if (code === 0) {
          resolve({
            success: true,
            version: output.trim()
          })
        } else {
          resolve({
            success: false,
            error: errorOutput || 'PicGo测试失败'
          })
        }
      })
      
      picgo.on('error', (err) => {
        resolve({
          success: false,
          error: `无法启动PicGo: ${err.message}`
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: `测试PicGo失败: ${error.message}`
    }
  }
})
```

## 在渲染进程中注册 API

需要在 `preload.js` 文件中暴露这些 API：

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  uploadToPicGo: (data) => ipcRenderer.invoke('upload-to-picgo', data),
  testPicGo: (data) => ipcRenderer.invoke('test-picgo', data)
})
```

## 注意事项

1. **PicGo 路径**: 确保用户选择的是 PicGo 的可执行文件路径
2. **权限**: 确保应用有权限执行外部程序
3. **临时文件**: 上传完成后要清理临时文件
4. **错误处理**: 要处理 PicGo 不存在、配置错误等情况
5. **安全性**: 验证文件路径和文件类型

## 测试流程

1. 用户选择 PicGo.exe 路径
2. 点击"测试上传"验证 PicGo 是否可用
3. 在 Markdown 编辑器中粘贴图片
4. 自动调用 PicGo 上传
5. 获取返回的 URL 并插入到编辑器

这样实现的效果就和 Typora 一样，用户只需要选择 PicGo 路径，就可以无缝使用图片上传功能。

## 🔧 故障排除

### 1. 文件选择器不工作
```bash
# 检查控制台输出
console.log('检查Electron环境:', {
  hasWindow: typeof window !== 'undefined',
  hasElectronAPI: typeof window.electronAPI !== 'undefined',
  hasSelectFile: typeof window.electronAPI?.selectFile !== 'undefined'
})
```

### 2. PicGo测试失败
- 确保 PicGo 路径指向正确的 exe 文件
- 检查 PicGo 是否能正常启动（双击测试）
- 查看控制台输出的详细错误信息

### 3. 图片上传失败
- 确保 PicGo 已配置图床
- 检查网络连接
- 查看 PicGo 日志文件

### 4. 开发环境调试
```javascript
// 在渲染进程中检查API是否可用
console.log('ElectronAPI状态:', {
  available: !!window.electronAPI,
  methods: Object.keys(window.electronAPI || {})
})
```

## 📦 完整项目结构

```
your-electron-app/
├── main.js                 # 主进程（复制 electron-main-example.js 内容）
├── preload.js             # preload脚本（复制 preload-example.js 内容）
├── dist/
│   └── index.html         # 构建后的前端文件
└── src/
    └── ...                # Vue/React 前端源码
```

## 🎯 验证清单

完成集成后，请验证以下功能：

- [ ] 文件选择器能正常打开
- [ ] 能够选择 PicGo.exe 文件
- [ ] PicGo 测试功能正常
- [ ] 在 Markdown 编辑器中粘贴图片能自动上传
- [ ] 上传成功后能获取到图片 URL
- [ ] 控制台有详细的调试日志

## 🔗 相关链接

- [PicGo 官网](https://molunerfinn.com/PicGo/)
- [Electron 官方文档](https://www.electronjs.org/docs)
- [Node.js child_process 文档](https://nodejs.org/api/child_process.html) 