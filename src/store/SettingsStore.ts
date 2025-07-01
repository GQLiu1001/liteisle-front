import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 设置接口定义
interface AppSettings {
  // 通用设置
  launchAtStartup: boolean
  language: string
  defaultPage: string
  
  // 专注设置
  focusTime: number
  breakTime: number
  soundEnabled: boolean
  soundType: string
  autoNextRound: boolean
  
  // 外观设置
  themeMode: 'light' | 'dark' | 'system'
  accentColor: string
  windowOpacity: number
  
  // 账户设置
  username: string
  avatar: string
  storageUsed: number
  storageTotal: number
}

export const useSettingsStore = defineStore('settings', () => {
  // 默认设置
  const defaultSettings: AppSettings = {
    // 通用设置
    launchAtStartup: false,
    language: 'zh-CN',
    defaultPage: 'home',
    
    // 专注设置
    focusTime: 25,
    breakTime: 5,
    soundEnabled: true,
    soundType: 'bell',
    autoNextRound: false,
    
    // 外观设置
    themeMode: 'light',
    accentColor: '#14B8A6',
    windowOpacity: 100,
    
    // 账户设置
    username: 'admin',
    avatar: '',
    storageUsed: 2.5 * 1024 * 1024 * 1024, // 2.5GB
    storageTotal: 10 * 1024 * 1024 * 1024  // 10GB
  }

  // 从localStorage加载设置
  const loadSettings = (): AppSettings => {
    try {
      const saved = localStorage.getItem('liteisle-settings')
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return defaultSettings
  }

  // 响应式状态
  const settings = ref<AppSettings>(loadSettings())
  const currentCategory = ref('general')

  // 计算属性
  const storageUsagePercentage = computed(() => {
    return Math.round((settings.value.storageUsed / settings.value.storageTotal) * 100)
  })

  const formattedStorageUsed = computed(() => {
    const gb = settings.value.storageUsed / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  })

  const formattedStorageTotal = computed(() => {
    const gb = settings.value.storageTotal / (1024 * 1024 * 1024)
    return `${gb.toFixed(0)} GB`
  })

  const appVersion = computed(() => '1.0.0')

  // Actions
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value[key] = value
    // 手动保存到localStorage
    saveSettings()
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('liteisle-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const setCurrentCategory = (category: string) => {
    currentCategory.value = category
  }

  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  const logout = () => {
    // 清除用户登录状态
    localStorage.removeItem('liteisle-user')
    localStorage.removeItem('liteisle-settings')
    
    // 重定向到登录页
    window.location.href = '#/login'
  }

  const checkForUpdates = async () => {
    // 模拟检查更新
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('应用已是最新版本')
      }, 2000)
    })
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    // 模拟密码修改
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (oldPassword === '123456') {
          resolve('密码修改成功')
        } else {
          reject('原密码错误')
        }
      }, 1000)
    })
  }

  // 语言选项
  const languageOptions = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁体中文' },
    { value: 'en-US', label: 'English' }
  ]

  // 默认页面选项
  const defaultPageOptions = [
    { value: 'home', label: '首页' },
    { value: 'drive', label: '云盘' },
    { value: 'music', label: '音乐' },
    { value: 'docs', label: '文档' }
  ]

  // 专注时长选项
  const focusTimeOptions = [
    { value: 15, label: '15 分钟' },
    { value: 25, label: '25 分钟' },
    { value: 45, label: '45 分钟' },
    { value: 60, label: '60 分钟' }
  ]

  // 休息时长选项
  const breakTimeOptions = [
    { value: 5, label: '5 分钟' },
    { value: 10, label: '10 分钟' },
    { value: 15, label: '15 分钟' }
  ]

  // 提示音选项
  const soundTypeOptions = [
    { value: 'bell', label: '铃声' },
    { value: 'chime', label: '钟声' },
    { value: 'notification', label: '通知音' },
    { value: 'none', label: '无声' }
  ]

  // 主题选项
  const themeOptions = [
    { value: 'light', label: '浅色模式' },
    { value: 'dark', label: '深色模式' },
    { value: 'system', label: '跟随系统' }
  ]

  // 主色调选项
  const accentColorOptions = [
    { value: '#14B8A6', label: 'Teal', color: '#14B8A6' },
    { value: '#3B82F6', label: 'Blue', color: '#3B82F6' },
    { value: '#10B981', label: 'Green', color: '#10B981' },
    { value: '#F59E0B', label: 'Amber', color: '#F59E0B' },
    { value: '#EF4444', label: 'Red', color: '#EF4444' },
    { value: '#8B5CF6', label: 'Purple', color: '#8B5CF6' }
  ]

  return {
    // State
    settings,
    currentCategory,
    
    // Computed
    storageUsagePercentage,
    formattedStorageUsed,
    formattedStorageTotal,
    appVersion,
    
    // Options
    languageOptions,
    defaultPageOptions,
    focusTimeOptions,
    breakTimeOptions,
    soundTypeOptions,
    themeOptions,
    accentColorOptions,
    
    // Actions
    updateSetting,
    saveSettings,
    setCurrentCategory,
    resetSettings,
    logout,
    checkForUpdates,
    changePassword
  }
}) 