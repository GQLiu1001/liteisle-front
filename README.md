# Liteisle Desktop

一个基于 Vue 3 + Vite + Electron 的现代化桌面应用程序，采用莫兰迪配色设计，提供专注学习、时间管理和多媒体功能的一体化解决方案。

## ✨ 项目特色

- 🎨 **现代化设计**: 莫兰迪配色 + 无边框窗口设计
- 📚 **专注学习**: 番茄钟、学习统计、活跃度追踪
- 🎵 **音乐播放**: 底部浮动音乐栏，支持播放控制
- 🗂️ **智能文件管理**: 三级目录、右键菜单、分享系统、回收站、排序搜索
- ⚙️ **完整设置中心**: 五大分类设置，个性化定制体验
- 🔐 **用户系统**: 简单的登录认证和会话管理

## 🚀 技术栈

- **前端框架**: Vue 3 + TypeScript + Composition API
- **构建工具**: Vite 5.x
- **桌面应用**: Electron 28.x
- **状态管理**: Pinia
- **路由管理**: Vue Router (Hash模式)
- **样式框架**: Tailwind CSS 3.x
- **图标库**: Lucide Vue Next
- **包管理**: npm

## 📁 项目结构

```
liteisle-front/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Sidebar.vue     # 左侧导航栏 (150px宽)
│   │   ├── Topbar.vue      # 顶部栏 (含窗口控制)
│   │   ├── MusicBar.vue    # 底部音乐栏 (浮动交互)
│   │   └── cards/          # 卡片组件集
│   │       ├── StudyCard.vue      # 累计学习时长卡片
│   │       ├── IsleCard.vue       # 净化岛屿轮播卡片
│   │       └── ActivityGrid.vue   # GitHub风格活跃度网格
│   ├── pages/              # 页面组件
│   │   ├── LoginPage.vue   # 登录页面
│   │   ├── HomePage.vue    # 首页 (学习数据展示)
│   │   ├── DrivePage.vue   # 云盘文件管理
│   │   ├── MusicPage.vue   # 音乐播放列表
│   │   ├── DocsPage.vue    # 文档管理
│   │   └── SettingsPage.vue # 系统设置
│   ├── store/              # Pinia状态管理
│   │   ├── index.ts        # Store入口配置
│   │   ├── FocusStore.ts   # 专注模式状态管理
│   │   ├── SettingsStore.ts # 系统设置状态管理
│   │   ├── MusicStore.ts   # 音乐播放状态管理
│   │   └── DocsStore.ts    # 文档管理状态管理
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义和守卫
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   ├── style.css           # 全局样式和Tailwind配置
│   └── vite-env.d.ts       # TypeScript类型声明
├── public/                 # 静态资源
│   ├── islepic/           # 岛屿图片资源
│   │   ├── isle1.png ~ isle6.png
│   │   └── README.md
│   ├── titlepic.png       # Logo图片
│   └── favicon.ico
├── release/               # Electron打包输出
├── scripts/               # 开发脚本
├── main.cjs              # Electron主进程
├── package.json          # 项目依赖配置
├── vite.config.ts        # Vite构建配置
├── tailwind.config.js    # Tailwind样式配置
├── tsconfig.json         # TypeScript配置
└── README.md
```

## 🎨 界面设计

### 布局架构
- **无边框窗口**: 自定义标题栏，集成窗口控制按钮
- **固定侧边栏**: 150px宽度，包含导航和Logo
- **顶部控制栏**: 居中的专注按钮，右侧用户菜单和窗口控制
- **主内容区域**: 响应式布局，右上角圆角设计
- **浮动音乐栏**: 底部hover展开式音乐控制面板

### 色彩系统
- **主背景**: #DDEEEE (liteisle-bg)
- **侧边栏**: #B9E3E3 (liteisle-sidebar)  
- **卡片背景**: #F9FAFA (纯白)
- **强调色**: Teal系列 (#14B8A6)
- **文字色**: Morandi灰色系列

### 交互特性
- **Hover反馈**: 所有可交互元素的悬浮效果
- **过渡动画**: 300ms缓动过渡
- **视觉层次**: 40px圆角 + 阴影系统
- **状态指示**: 当前播放、专注状态的视觉反馈

## ⚡ 核心功能

### 🔐 用户系统
- 简单的用户名/密码登录 (admin/123456)
- 会话状态管理和自动跳转
- 用户头像下拉菜单和注销功能

### 📚 专注学习
- **专注模式**: 一键开始/停止专注计时
- **学习统计**: 累计学习时长展示 (100小时目标)
- **活跃度网格**: GitHub风格的16x16学习热力图
- **进度追踪**: 可视化学习进度和成就

### 🎵 音乐功能
- **底部音乐栏**: 悬浮式交互设计，500ms延迟展开
- **播放控制**: 播放/暂停、上一首/下一首、音量、重复模式
- **音乐信息**: 歌曲名称、艺术家、播放进度显示
- **列表管理**: 支持播放列表功能 (开发中)

### 🏝️ 净化岛屿
- **图片轮播**: 6张岛屿图片的左右箭头切换
- **数量统计**: 当前净化岛屿数量显示
- **视觉效果**: 渐变背景和圆形展示

### 🗂️ 文件管理
- **三级目录结构**: 音乐、文档、视频、图片四大分类
- **云盘功能**: 文件上传、文件夹创建、层级导航
- **智能排序**: 支持按名称、修改时间、创建时间、文件大小排序
- **多视图模式**: 网格视图和列表视图切换
- **右键菜单**: 打开、下载、分享、复制、剪切、删除、重命名、移动、详细信息
- **分享系统**: 智能分享文件和文件夹，支持有效期设置(1天/7天/30天/永久)、访问密码保护、一键复制链接
- **回收站系统**: 完整的删除/还原机制，支持一键操作
- **搜索功能**: 实时搜索文件和文件夹
- **批量操作**: 支持复制、剪切、粘贴等批量文件操作

### ⚙️ 系统设置
- **设置分类**: 通用、专注、外观、账户与云盘、关于五大分类
- **通用设置**: 开机自启、语言选择(简体中文/繁体中文/English)、默认页面
- **专注设置**: 专注时长(15/25/45/60分钟)、休息时长、提示音效、自动开始
- **外观设置**: 主题模式(浅色/深色/跟随系统)、主色调选择、窗口透明度
- **账户管理**: 账户信息、密码修改、注销登录、云盘存储管理
- **关于信息**: 版本信息、更新检查、帮助反馈、重置设置

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Windows 10+ / macOS 10.15+ / Linux

### 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd liteisle-front

# 安装依赖
npm install

# 开发模式 (Web)
npm run dev

# Electron开发模式
npm run electron:dev
```

### 构建部署

```bash
# 构建Web版本
npm run build

# 构建并打包Electron应用
npm run build && npm run electron:pack

# 一键构建和打包
npm run build && npx electron-builder
```

### 开发脚本

```bash
# Web开发服务器
npm run dev                    # 启动Vite开发服务器

# Electron开发
npx electron .                 # 直接运行Electron
npm run electron:dev           # 开发模式 (如果有该脚本)

# 构建相关
npm run build                  # 构建生产版本
npx vite build                 # 直接调用Vite构建
npx electron-builder          # 打包Electron应用
```

## 🔧 配置说明

### Electron配置
- **无边框窗口**: `frame: false`, `titleBarStyle: 'hidden'`
- **窗口控制**: 自定义最小化、最大化、关闭按钮
- **IPC通信**: 主进程和渲染进程间的窗口控制通信

### 路由配置
- **Hash模式**: 兼容Electron环境
- **路由守卫**: 登录状态检查和自动跳转
- **懒加载**: 页面组件按需加载

### 状态管理
- **Pinia Store**: 组合式API风格的状态管理
- **持久化**: localStorage存储用户登录状态
- **响应式**: 基于Vue 3的响应式状态更新

## 📱 兼容性

- **桌面平台**: Windows 10+, macOS 10.15+, Linux
- **浏览器支持**: Chrome 88+, Firefox 78+, Safari 14+
- **屏幕分辨率**: 最小支持 1024x768

## 🎯 开发路线图

### 🚧 进行中
- [ ] 音乐播放核心功能完善
- [ ] 文档编辑器集成
- [ ] 云盘服务器端集成

### 📋 计划中
- [ ] 数据导入导出功能
- [ ] 多主题支持
- [ ] 快捷键系统
- [ ] 自动更新机制
- [ ] 多语言国际化

### ✅ 已完成
- [x] 基础项目架构搭建
- [x] 登录系统和用户管理
- [x] 无边框窗口设计
- [x] 专注模式和学习统计
- [x] 响应式布局优化
- [x] 音乐栏交互设计
- [x] Electron应用打包
- [x] 系统设置页面完整实现
- [x] 云盘文件管理系统
- [x] 三级目录结构设计
- [x] 文件排序和视图切换
- [x] 右键菜单功能系统
- [x] 回收站删除/还原机制
- [x] 文件搜索和批量操作
- [x] 分享功能系统（链接生成、有效期、密码保护）

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用开发
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Lucide](https://lucide.dev/) - 美观一致的图标库 