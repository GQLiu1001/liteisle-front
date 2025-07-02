import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { Settings, User, FileText } from 'lucide-vue-next'

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

export interface SettingCategory {
  id: string
  name: string
  description: string
  icon: any
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const currentCategoryId = ref('general')
  
  const settings = ref<AppSettings>({
    launchAtStartup: false,
    language: 'zh-CN',
    defaultPage: 'home',
    focusTime: 25,
    breakTime: 5,
    soundEnabled: true,
    soundType: 'bell',
    autoNextRound: false,
    themeMode: 'light',
    accentColor: '#14B8A6',
    windowOpacity: 100,
    username: 'admin',
    avatar: '',
    storageUsed: 2.1 * 1024 * 1024 * 1024, // 2.1GB
    storageTotal: 5 * 1024 * 1024 * 1024   // 5GB
  })

  // 云盘信息
  const cloudStorage = ref({
    used: 2.1,  // 已使用 2.1GB
    total: 5    // 总容量 5GB
  })

  // 设置分类
  const categories = ref<SettingCategory[]>([
    {
      id: 'general',
      name: '通用设置',
      description: '基本功能设置',
      icon: shallowRef(Settings)
    },
    {
      id: 'account',
      name: '账户与云盘',
      description: '账户信息和云盘管理',
      icon: shallowRef(User)
    },
    {
      id: 'about',
      name: '关于',
      description: '应用信息和版本',
      icon: shallowRef(FileText)
    }
  ])

  // 计算属性
  const currentCategory = computed(() => {
    return categories.value.find(cat => cat.id === currentCategoryId.value) || categories.value[0]
  })

  const storageInfo = computed(() => {
    if (cloudStorage.value.total === 0) {
      return { percentage: 0, text: 'N/A' }
    }
    const percentage = (cloudStorage.value.used / cloudStorage.value.total) * 100
    const text = `已使用 ${cloudStorage.value.used.toFixed(1)} GB / ${cloudStorage.value.total} GB`
    return { percentage, text }
  })

  // 方法
  const setCurrentCategoryId = (categoryId: string) => {
    currentCategoryId.value = categoryId
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value[key] = value
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('liteisle-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const logout = () => {
    // 清除用户登录状态
    localStorage.removeItem('liteisle-user')
    localStorage.removeItem('liteisle-settings')
    
    // 重定向到登录页
    window.location.href = '#/login'
  }

  const checkForUpdates = () => {
    // 模拟检查更新
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('应用已是最新版本')
      }, 2000)
    })
  }

  const changePassword = (oldPassword: string, newPassword: string) => {
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

  return {
    // 状态
    currentCategoryId,
    settings,
    cloudStorage,
    categories,
    
    // 计算属性
    currentCategory,
    storageInfo,
    
    // 方法
    setCurrentCategoryId,
    updateSetting,
    saveSettings,
    logout,
    checkForUpdates,
    changePassword
  }
}) 