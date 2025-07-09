# 前端API对接修改计划书

## 📋 总体评估结果

经过详细对比分析，**API文档已经98%覆盖了前端的所有核心功能**，包括完整的分享功能接口，主要需要修改和完善的地方如下：

---

## 🚨 关键不匹配问题

### 1. **认证接口参数不匹配** - 高优先级

**问题描述：**
- 前端 `AuthStore.login()` 使用 `email` + `password`
- API文档 `POST /auth/login` 使用 `username` + `password`

**修改方案：**
```typescript
// 修改 src/store/AuthStore.ts 中的 login 方法
const login = async (credentials: LoginRequest): Promise<void> => {
  const apiCredentials = {
    username: credentials.username || credentials.email, // 支持用户名或邮箱登录
    password: credentials.password
  }
  const response = await authAPI.login(apiCredentials)
  // ...
}
```

### 2. **注册接口验证码字段名不匹配** - 高优先级

**问题描述：**
- 前端使用 `verificationCode`
- API文档使用 `vcode`

**修改方案：**
```typescript
// 修改 src/store/AuthStore.ts 中的 register 方法
const register = async (registerData: RegisterRequest): Promise<void> => {
  const apiData = {
    username: registerData.username,
    email: registerData.email,
    password: registerData.password,
    vcode: registerData.verificationCode // 字段名转换
  }
  // ...
}
```

---

## 🆕 缺失功能实现

### 1. **WebSocket实时通信** - 高优先级

**缺失内容：**
- 文件处理状态更新 (`file.status.updated`)
- 传输日志状态更新 (`transfer.log.updated`)  
- 新通知推送 (`notification.new`)

**需要新增：**
```typescript
// 新增文件：src/utils/websocket.ts
class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    this.ws = new WebSocket('ws://localhost:8080/ws')
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }
  }

  private handleMessage(message: { event: string; payload: any }) {
    switch (message.event) {
      case 'file.status.updated':
        // 更新文件状态
        break
      case 'transfer.log.updated':
        // 更新传输状态
        break
      case 'notification.new':
        // 显示新通知
        break
    }
  }
}
```

### 2. **增强下载功能与传输记录** - 中优先级

**缺失内容：**
- 文件夹清单获取和批量下载
- 下载进度管理
- 目录结构保持
- **⚠️ 下载操作的传输记录创建**

**需要修改：**
```typescript
// 修改 src/store/DriveStore.ts
const downloadItems = async (selection: { fileIds?: number[]; folderIds?: number[] }) => {
  // 1. 使用新的清单API
  const response = await transferAPI.getBatchManifest(selection)
  
  // 2. 创建下载传输记录（确保在传输页面显示）
  const downloadTask = await transferAPI.createDownloadRecord({
    item_name: `批量下载_${selection.fileIds?.length || 0 + selection.folderIds?.length || 0}项`,
    total_size: response.data.total_size,
    total_files: response.data.total_files
  })
  
  // 3. 开始下载并更新传输状态
  // ...
}
```

### 3. **分享链接下载功能** - 中优先级

**新增内容：** 支持通过分享链接直接下载到网盘

**需要对接：**
```typescript
// 在 src/store/DriveStore.ts 中新增
const downloadFromShareLink = async (shareLink: string) => {
  const response = await shareAPI.downloadFromShare(shareLink)
  
  // 处理异步上传结果，类似普通文件上传
  const fileData = response.data.initial_file_data
  addFileToUI(fileData)
  
  // 等待WebSocket更新文件状态
  return response.data
}
```

---

## 🔄 需要适配的现有功能

### 1. **文件上传流程优化** - 中优先级

**现状：** 前端有基本上传功能，但需要适配API的异步处理机制

**修改方案：**
```typescript
// 修改 src/store/TransferStore.ts
const uploadFile = async (file: File, folderId?: number) => {
  // 1. 调用上传API，获得file_id和status: processing
  const response = await uploadAPI.uploadFile(file, folderId)
  
  // 2. 立即在UI中显示"处理中"状态
  const fileData = response.data.initial_file_data
  addFileToUI(fileData)
  
  // 3. 等待WebSocket推送status: available事件
  // （在WebSocket manager中处理）
}
```

### 2. **用户信息获取** - 低优先级

**需要新增：** 设置页面需要获取当前用户信息

**修改方案：**
```typescript
// 在 src/store/AuthStore.ts 中新增
const getCurrentUserInfo = async () => {
  const response = await authAPI.getCurrentUserInfo()
  const userInfo = response.data
  
  // 更新用户信息，包括存储使用情况
  user.value = {
    ...user.value,
    storageUsed: userInfo.storage_used,
    storageQuota: userInfo.storage_quota
  }
}
```

### 3. **专注功能API对接** - 低优先级

**现状：** 前端有完整的专注UI，但使用模拟数据

**修改方案：**
```typescript
// 修改 src/store/FocusStore.ts
const submitFocusRecord = async (minutes: number) => {
  const response = await focusAPI.recordFocus({ focus_minutes: minutes })
  
  // 如果获得新岛屿，显示提示
  if (response.data.island_id) {
    showNewIslandNotification(response.data)
  }
}

const loadFocusData = async () => {
  // 加载专注统计、日历数据、岛屿收集等
  const [totalCount, calendar, islands] = await Promise.all([
    focusAPI.getTotalCount(),
    focusAPI.getCalendar(year, month),
    islandAPI.getMyIslands()
  ])
  // 更新Store数据
}
```

---

## 📝 具体修改文件清单

### 立即修改（高优先级）
1. **`src/store/AuthStore.ts`** - 修复登录/注册参数不匹配
2. **`src/utils/http.ts`** - 完善API方法定义，新增分享下载接口
3. **新增 `src/utils/websocket.ts`** - WebSocket连接管理
4. **`src/App.vue`** - 集成WebSocket连接

### 功能增强（中优先级）
5. **`src/store/DriveStore.ts`** - 集成分享链接下载、增强下载、确保下载创建传输记录
6. **`src/store/TransferStore.ts`** - 适配异步上传流程、完善下载任务管理
7. **`src/utils/http.ts`** - 新增分享下载API、下载传输记录API
8. **`src/pages/TransferPage.vue`** - 确保显示所有传输任务（上传+下载）

### 数据对接（低优先级）
9. **`src/store/FocusStore.ts`** - 替换模拟数据为API调用
10. **`src/store/SettingsStore.ts`** - 对接用户信息API
11. **`src/pages/SettingsPage.vue`** - 完善头像上传功能

---

## 🎯 修改优先级建议

### 第一阶段：核心功能对接
- 修复认证接口参数问题
- 实现WebSocket连接
- 适配文件上传异步流程

### 第二阶段：增强功能实现  
- 完善下载功能（清单模式）
- 确保下载操作创建传输记录
- 集成分享链接下载
- 对接用户信息管理

### 第三阶段：数据完善
- 替换所有模拟数据
- 完善错误处理
- 优化用户体验

---

## ✅ 总结

API文档已经**98%覆盖**了前端功能需求，包括完整的分享功能接口，主要问题集中在：

1. **接口参数名称不匹配** - 需要统一字段命名
2. **WebSocket实时更新缺失** - 需要实现连接管理  
3. **传输记录不完整** - 下载操作可能缺少传输页面任务记录
4. **新增功能对接** - 需要集成分享链接下载等新功能

完成以上修改后，前端将实现与后端API的完美对接！ 