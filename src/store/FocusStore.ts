import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface DailyFocusData {
  date: string // yyyy-mm-dd格式
  focusMinutes: number // 当日专注时长（分钟）
}

interface UserFocusRecord {
  id: number
  userId: number
  focusDate: string // yyyy-mm-dd格式
  focusMinutes: number
  createTime: string
}

export const useFocusStore = defineStore('focus', () => {
  // 核心状态
  const totalFocusTime = ref(360000) // 总专注时长 (100小时)
  const currentStudyTime = ref(180) // 今日专注时长 (分钟)
  const isFocusing = ref(false)
  const focusStartTime = ref(0)
  const focusTimer = ref<number | null>(null)
  
  // 岛屿相关状态
  const isleCount = ref(8) // 净化岛屿总数，现在扩充到8个
  const currentIsleIndex = ref(0) // 当前显示的岛屿索引

  // 每日专注时间记录
  const dailyFocusData = ref(new Map<string, number>([
    ['2025-07-01', 180],
    ['2025-07-02', 30]
  ]))

  // 初始化最近4个月的数据
  const initDailyData = () => {
    const today = new Date()
    // 生成4个月的数据（17周 * 7天 = 119天）
    for (let i = 0; i < 119; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0] // yyyy-mm-dd格式
      
      // 生成模拟的专注时间数据
      const random = Math.random()
      let focusMinutes = 0
      
      // 75%概率有专注时间
      if (random > 0.25) {
        // 专注时间在20-180分钟之间（更符合实际）
        focusMinutes = Math.floor(Math.random() * 160) + 20
      }
      
      dailyFocusData.value.set(dateStr, focusMinutes)
    }
  }

  // 初始化数据
  initDailyData()

  // 计算属性
  const formattedTotalTime = computed(() => {
    return `${totalFocusTime.value / 3600000} 小时`
  })

  const formattedCurrentTime = computed(() => {
    const hours = Math.floor(currentStudyTime.value / 60)
    const minutes = currentStudyTime.value % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  })

  const totalFocusCount = computed(() => {
    let count = 0
    for (const minutes of dailyFocusData.value.values()) {
      if (minutes > 0) {
        count++
      }
    }
    return count
  })

  // 方法
  const startFocus = () => {
    isFocusing.value = true
    focusStartTime.value = Date.now()
  }

  const stopFocus = () => {
    if (isFocusing.value && focusStartTime.value) {
      const endTime = Date.now()
      const focusMinutes = Math.floor((endTime - focusStartTime.value) / 1000)
      currentStudyTime.value += focusMinutes
      totalFocusTime.value += focusMinutes * 1000
      
      // 更新今日专注时间记录
      const today = new Date().toISOString().split('T')[0]
      const todayFocus = dailyFocusData.value.get(today) || 0
      dailyFocusData.value.set(today, todayFocus + focusMinutes)
    }
    isFocusing.value = false
    focusStartTime.value = 0
  }

  // 获取专注活动数据（用于贡献图）
  const getFocusActivityData = computed(() => {
    const activityData: { date: string; count: number }[] = []
    
    for (const [date, minutes] of dailyFocusData.value.entries()) {
      activityData.push({
        date: date,
        count: minutes
      })
    }
    
    return activityData
  })

  // 获取签到统计
  const getCheckInStats = computed(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let monthlyCheckins = 0
    let consecutiveCheckins = 0
    
    // 计算本月签到
    for (const [dateStr, minutes] of dailyFocusData.value.entries()) {
      const date = new Date(dateStr)
      if (date.getMonth() === currentMonth && 
          date.getFullYear() === currentYear && 
          minutes >= 30) {
        monthlyCheckins++
      }
    }
    
    // 计算连续签到（从今天开始往前，最多4个月）
    for (let i = 0; i < 119; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const minutes = dailyFocusData.value.get(dateStr) || 0
      
      if (minutes >= 30) {
        consecutiveCheckins++
      } else {
        break
      }
    }
    
    return {
      monthlyCheckins,
      consecutiveCheckins
    }
  })

  // 切换岛屿
  const nextIsle = () => {
    currentIsleIndex.value = (currentIsleIndex.value + 1) % isleCount.value
  }

  const prevIsle = () => {
    currentIsleIndex.value = (currentIsleIndex.value - 1 + isleCount.value) % isleCount.value
  }

  const addIsle = () => {
    isleCount.value++
  }

  return {
    // 状态
    totalFocusTime,
    currentStudyTime,
    isFocusing,
    focusStartTime,
    focusTimer,
    isleCount,
    currentIsleIndex,
    dailyFocusData,
    
    // 计算属性
    formattedTotalTime,
    formattedCurrentTime,
    getFocusActivityData,
    getCheckInStats,
    totalFocusCount,
    
    // 方法
    startFocus,
    stopFocus,
    nextIsle,
    prevIsle,
    addIsle
  }
}) 