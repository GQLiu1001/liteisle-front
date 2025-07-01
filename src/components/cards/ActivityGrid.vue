<template>
  <div class="card h-full flex flex-col min-h-0 overflow-hidden w-full p-4 lg:p-6">
    <div class="flex items-center justify-between mb-3 lg:mb-4 flex-shrink-0">
      <h3 class="text-lg lg:text-xl font-semibold text-morandi-900">专注记录</h3>
      <span class="text-xs lg:text-sm text-morandi-600">{{ currentMonthName }}</span>
    </div>
    
    <!-- 简单日历 -->
    <div class="flex-1 min-h-0 overflow-auto mb-2">
      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
        <div v-for="day in weekDays" :key="day" 
             class="text-xs text-morandi-500 text-center py-1">
          {{ day }}
        </div>
      </div>
      
      <!-- 日期网格 -->
      <div class="grid grid-cols-7 gap-1 pb-2">
        <div v-for="(day, index) in calendarDays" :key="index"
             :class="[
               'aspect-square flex items-center justify-center rounded-lg text-xs font-medium relative min-h-[28px] max-h-[36px]',
               day.date ? 'cursor-pointer transition-colors' : '',
               day.date && day.isToday ? 'ring-2 ring-blue-400' : '',
               day.date && day.hasFocus ? 'bg-blue-400 text-white' : day.date ? 'bg-morandi-100 text-morandi-700' : 'bg-transparent'
             ]">
          <span v-if="day.date" class="relative z-10">{{ day.date }}</span>
          <!-- 专注时长提示 -->
          <div v-if="day.date && day.focusMinutes > 0" 
               class="absolute inset-0 flex items-end justify-end p-0.5">
            <div class="w-1.5 h-1.5 bg-green-400 rounded-full" 
                 :title="`专注${day.focusMinutes}分钟`"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-morandi-200 flex-shrink-0">
      <div class="flex items-center justify-between text-xs lg:text-sm text-morandi-600 mb-2">
        <span>本月签到: {{ monthlyStats.checkedDays }}天</span>
        <span>总专注: {{ Math.round(monthlyStats.totalMinutes/60) }}小时</span>
      </div>
      <!-- 图例 -->
      <div class="hidden sm:flex items-center justify-center gap-4 text-xs text-morandi-500">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-morandi-100 rounded-sm border"></div>
          <span>未签到</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <span>已签到</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFocusStore } from '@/store/FocusStore'

const focusStore = useFocusStore()

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前月份名称
const currentMonthName = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

// 生成当前月份的日历数据
const calendarDays = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // 本月第一天
  const firstDay = new Date(year, month, 1)
  // 本月最后一天
  const lastDay = new Date(year, month + 1, 0)
  // 第一天是星期几（0=周日）
  const firstDayOfWeek = firstDay.getDay()
  // 本月有多少天
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  // 添加前面的空白天数
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: null, hasFocus: false, focusMinutes: 0, isToday: false })
  }
  
  // 添加本月的所有天数
  for (let date = 1; date <= daysInMonth; date++) {
    const currentDate = new Date(year, month, date)
    const dateStr = currentDate.toISOString().split('T')[0]
    const focusMinutes = focusStore.dailyFocusData.get(dateStr) || 0
    const isToday = date === now.getDate()
    
    days.push({
      date,
      hasFocus: focusMinutes >= 30,
      focusMinutes,
      isToday
    })
  }
  
  return days
})

// 本月统计
const monthlyStats = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  let checkedDays = 0
  let totalMinutes = 0
  
  for (let date = 1; date <= new Date(year, month + 1, 0).getDate(); date++) {
    const currentDate = new Date(year, month, date)
    const dateStr = currentDate.toISOString().split('T')[0]
    const focusMinutes = focusStore.dailyFocusData.get(dateStr) || 0
    
    if (focusMinutes >= 30) {
      checkedDays++
    }
    totalMinutes += focusMinutes
  }
  
  return {
    checkedDays,
    totalMinutes
  }
})
</script>

<style scoped>
/* 确保日历网格适应容器 */
.grid {
  gap: 0.5rem;
}

/* 移除任何可能影响布局的样式 */
</style>

 