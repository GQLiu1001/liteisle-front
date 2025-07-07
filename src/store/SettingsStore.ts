import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { Settings, User, FileText, Clock, Share2 } from 'lucide-vue-next'

// 设置接口定义
interface AppSettings {
  // 通用设置
  launchAtStartup: boolean
  downloadDirectory: string
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

export interface ShareItem {
  id: number
  name: string
  type: 'file' | 'folder'
  shareToken: string // 分享令牌，而非完整URL
  sharePassword: string // 访问密码
  expiryDate: string
  status: 'active' | 'expired' | 'disabled'
  createdAt: string
  accessCount: number
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const currentCategoryId = ref('general')
  
  const settings = ref<AppSettings>({
    launchAtStartup: false,
    downloadDirectory: 'C:\\Users\\Public\\Downloads',
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

  // 分享数据 - 分页相关状态
  const shareItems = ref<ShareItem[]>([])
  const shareCurrentPage = ref(1)
  const sharePageSize = ref(10)
  const shareTotal = ref(0)
  const shareLoading = ref(false)
  const shareHasMore = ref(true)

  // 模拟的完整分享数据
  const mockShareData: ShareItem[] = [
    {
      id: 1,
      name: '4coding',
      type: 'folder',
      shareToken: 'abc123def456ghi789',
      sharePassword: 'xyz789',
      expiryDate: '2025/04/25',
      status: 'active',
      createdAt: '2025/04/25 11:22',
      accessCount: 17
    },
    {
      id: 2, 
      name: '4coding',
      type: 'folder',
      shareToken: 'def456ghi789jkl012',
      sharePassword: 'abc123',
      expiryDate: '2025/03/19',
      status: 'active',
      createdAt: '2025/03/19 15:08',
      accessCount: 0
    },
    {
      id: 3,
      name: '4coding',
      type: 'folder', 
      shareToken: 'ghi789jkl012mno345',
      sharePassword: 'def456',
      expiryDate: '2025/03/11',
      status: 'active',
      createdAt: '2025/03/11 21:41',
      accessCount: 3
    },
    {
      id: 4,
      name: '项目文档',
      type: 'folder',
      shareToken: 'abc123def456ghi789',
      sharePassword: 'xyz789',
      expiryDate: '2025/04/25',
      status: 'active',
      createdAt: '2025/04/25 11:22',
      accessCount: 17
    },
    {
      id: 5, 
      name: '设计稿',
      type: 'folder',
      shareToken: 'def456ghi789jkl012',
      sharePassword: 'abc123',
      expiryDate: '2025/03/19',
      status: 'active',
      createdAt: '2025/03/19 15:08',
      accessCount: 0
    },
    {
      id: 6,
      name: '会议记录',
      type: 'folder', 
      shareToken: 'ghi789jkl012mno345',
      sharePassword: 'def456',
      expiryDate: '2025/03/11',
      status: 'active',
      createdAt: '2025/03/11 21:41',
      accessCount: 3
    },
    {
      id: 7,
      name: '学习资料',
      type: 'folder',
      shareToken: 'abc123def456ghi789',
      sharePassword: 'xyz789',
      expiryDate: '2025/04/25',
      status: 'active',
      createdAt: '2025/04/25 11:22',
      accessCount: 17
    },
    {
      id: 8, 
      name: '音乐收藏',
      type: 'folder',
      shareToken: 'def456ghi789jkl012',
      sharePassword: 'abc123',
      expiryDate: '2025/03/19',
      status: 'active',
      createdAt: '2025/03/19 15:08',
      accessCount: 0
    },
    {
      id: 9,
      name: '图片素材',
      type: 'folder', 
      shareToken: 'ghi789jkl012mno345',
      sharePassword: 'def456',
      expiryDate: '2025/03/11',
      status: 'active',
      createdAt: '2025/03/11 21:41',
      accessCount: 3
    },
    {
      id: 10,
      name: '视频教程',
      type: 'folder',
      shareToken: 'abc123def456ghi789',
      sharePassword: 'xyz789',
      expiryDate: '2025/04/25',
      status: 'active',
      createdAt: '2025/04/25 11:22',
      accessCount: 17
    },
    {
      id: 11, 
      name: '代码片段',
      type: 'folder',
      shareToken: 'def456ghi789jkl012',
      sharePassword: 'abc123',
      expiryDate: '2025/03/19',
      status: 'active',
      createdAt: '2025/03/19 15:08',
      accessCount: 0
    },
    {
      id: 12,
      name: '工具软件',
      type: 'folder', 
      shareToken: 'ghi789jkl012mno345',
      sharePassword: 'def456',
      expiryDate: '2025/03/11',
      status: 'active',
      createdAt: '2025/03/11 21:41',
      accessCount: 3
    }
  ]

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
      id: 'shares',
      name: '我的分享',
      description: '分享文件管理',
      icon: shallowRef(Share2)
    },
    {
      id: 'focus',
      name: '专注记录',
      description: '专注历史和统计',
      icon: shallowRef(Clock)
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

  // 加载分享数据
  const loadShareItems = async (page: number = 1, reset: boolean = false) => {
    if (shareLoading.value) return

    shareLoading.value = true
    
    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const startIndex = (page - 1) * sharePageSize.value
      const endIndex = startIndex + sharePageSize.value
      const pageData = mockShareData.slice(startIndex, endIndex)
      
      if (reset) {
        shareItems.value = pageData
        shareCurrentPage.value = page
      } else {
        shareItems.value.push(...pageData)
        shareCurrentPage.value = page
      }
      
      shareTotal.value = mockShareData.length
      shareHasMore.value = endIndex < mockShareData.length
      
    } catch (error) {
      console.error('加载分享数据失败:', error)
    } finally {
      shareLoading.value = false
    }
  }

  // 加载更多分享数据
  const loadMoreShareItems = async () => {
    if (!shareHasMore.value || shareLoading.value) return
    await loadShareItems(shareCurrentPage.value + 1, false)
  }

  // 刷新分享数据
  const refreshShareItems = async () => {
    await loadShareItems(1, true)
  }

  const cancelShare = (shareId: number) => {
    const index = shareItems.value.findIndex(item => item.id === shareId)
    if (index > -1) {
      shareItems.value.splice(index, 1)
      shareTotal.value = Math.max(0, shareTotal.value - 1)
      return true
    }
    return false
  }

  // 生成分享链接的方法
  const generateShareLink = (shareToken: string) => {
    return `https://liteisle.com/share/${shareToken}`
  }

  // 复制分享信息（链接+密码）
  const copyShareInfo = async (shareToken: string, sharePassword: string) => {
    const shareLink = generateShareLink(shareToken)
    const shareInfo = `分享链接: ${shareLink}\n访问密码: ${sharePassword}`
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareInfo)
        return true
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = shareInfo
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      }
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  return {
    // 状态
    currentCategoryId,
    settings,
    cloudStorage,
    categories,
    shareItems,
    shareLoading,
    shareHasMore,
    shareTotal,
    shareCurrentPage,
    
    // 计算属性
    currentCategory,
    storageInfo,
    
    // 方法
    setCurrentCategoryId,
    updateSetting,
    saveSettings,
    logout,
    checkForUpdates,
    changePassword,
    loadShareItems,
    loadMoreShareItems,
    refreshShareItems,
    cancelShare,
    generateShareLink,
    copyShareInfo
  }
}) 