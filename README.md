# Liteisle Desktop

一个基于 Vue 3 + Vite + Electron 的桌面应用程序，采用莫兰迪配色设计，提供专注学习和时间管理功能。

## 🚀 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **桌面应用**: Electron
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式框架**: Tailwind CSS
- **图标库**: Lucide Vue

## 📁 项目结构

```
liteisle-front/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Sidebar.vue     # 左侧导航栏
│   │   ├── Topbar.vue      # 顶部栏
│   │   ├── MusicBar.vue    # 底部音乐栏
│   │   └── cards/          # 卡片组件
│   │       ├── StudyCard.vue      # 累计学习时长卡片
│   │       ├── IsleCard.vue       # 净化岛屿卡片
│   │       └── ActivityGrid.vue   # 活跃度网格
│   ├── pages/              # 页面组件
│   │   ├── HomePage.vue    # 首页
│   │   ├── DrivePage.vue   # 云盘页面
│   │   ├── MusicPage.vue   # 音乐页面
│   │   ├── DocsPage.vue    # 文档页面
│   │   └── SettingsPage.vue # 设置页面
│   ├── store/              # 状态管理
│   │   ├── index.ts
│   │   └── FocusStore.ts   # 专注状态管理
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── App.vue             # 主应用组件
│   ├── main.ts             # 应用入口
│   └── style.css           # 全局样式
├── public/                 # 静态资源
│   └── islepic/           # 岛屿图片
└── package.json
```

## 🎨 设计特色

- **莫兰迪配色**: 采用温和的莫兰迪色调，营造舒适的视觉体验
- **圆角卡片**: 使用圆角卡片设计，增强现代感
- **简约图标**: 配合 Lucide 图标库，保持界面简洁
- **响应式布局**: 适配不同屏幕尺寸

## ⚡ 主要功能

1. **专注模式**: 开始/停止专注，记录学习时长
2. **学习统计**: 显示累计学习时间和进度
3. **岛屿系统**: 净化岛屿轮播展示
4. **活跃度展示**: GitHub 风格的学习活跃度网格
5. **音乐播放**: 底部音乐播放控制栏

## 🛠️ 开发指南

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### Electron 开发

```bash
npm run electron:serve
```

### 打包应用

```bash
npm run electron:pack
```

## 📝 开发说明

- 使用 `<script setup lang="ts">` 语法糖
- 所有颜色通过 Tailwind 自定义主题配置
- Sidebar & Topbar 使用固定定位
- 岛屿图片存放在 `/public/islepic/` 目录
- 使用 Pinia 管理专注状态和学习数据

## 🎯 后续规划

- [ ] 完善音乐播放功能
- [ ] 添加云盘文件管理
- [ ] 完善文档编辑功能
- [ ] 添加更多个性化设置
- [ ] 优化 Electron 性能

## �� 许可证

MIT License 