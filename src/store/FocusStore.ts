import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFocusStore = defineStore('focus', () => {
  // 状态
  const totalStudyTime = ref(100) // 累计学习时长（小时）
  const currentStudyTime = ref(0) // 当前学习时长（分钟）
  const isFocusing = ref(false) // 是否正在专注
  const startTime = ref<Date | null>(null) // 开始时间
  const isleCount = ref(32) // 岛屿数量
  const currentIsleIndex = ref(0) // 当前岛屿索引

  // 计算属性
  const formattedTotalTime = computed(() => {
    return `${totalStudyTime.value} 小时`
  })

  const formattedCurrentTime = computed(() => {
    const hours = Math.floor(currentStudyTime.value / 60)
    const minutes = currentStudyTime.value % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  })

  // 方法
  const startFocus = () => {
    isFocusing.value = true
    startTime.value = new Date()
  }

  const stopFocus = () => {
    if (isFocusing.value && startTime.value) {
      const endTime = new Date()
      const focusMinutes = Math.floor((endTime.getTime() - startTime.value.getTime()) / (1000 * 60))
      currentStudyTime.value += focusMinutes
      totalStudyTime.value += focusMinutes / 60
    }
    isFocusing.value = false
    startTime.value = null
  }

  const nextIsle = () => {
    currentIsleIndex.value = (currentIsleIndex.value + 1) % 6 // 假设有6个岛屿
  }

  const prevIsle = () => {
    currentIsleIndex.value = currentIsleIndex.value === 0 ? 5 : currentIsleIndex.value - 1
  }

  const addIsle = () => {
    isleCount.value++
  }

  return {
    // 状态
    totalStudyTime,
    currentStudyTime,
    isFocusing,
    startTime,
    isleCount,
    currentIsleIndex,
    
    // 计算属性
    formattedTotalTime,
    formattedCurrentTime,
    
    // 方法
    startFocus,
    stopFocus,
    nextIsle,
    prevIsle,
    addIsle
  }
}) 