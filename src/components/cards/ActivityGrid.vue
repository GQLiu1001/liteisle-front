<template>
  <div class="card h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-semibold text-morandi-900">学习活跃度</h3>
      <span class="text-base text-morandi-600">最近4个月</span>
    </div>
    
    <!-- 月份标签 -->
    <div class="flex justify-between items-center mb-4">
      <div class="text-sm text-morandi-600 grid grid-cols-4 gap-10 flex-1 ml-10">
        <span v-for="month in months" :key="month">{{ month }}</span>
      </div>
    </div>
    
    <!-- 活跃度网格 -->
    <div class="flex gap-2 flex-1 min-h-0">
      <!-- 星期标签 -->
      <div class="flex flex-col gap-1.5 mr-3">
        <div class="h-3 text-xs text-morandi-600 flex items-center">周</div>
        <div v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="h-3 text-xs text-morandi-600 flex items-center">
          {{ day }}
        </div>
      </div>
      
      <!-- 网格数据 -->
      <div class="grid grid-cols-20 gap-1 flex-1">
        <div
          v-for="(activity, index) in activityData"
          :key="index"
          class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-sage-400"
          :class="getActivityClass(activity)"
          :title="`${activity.date}: ${activity.count} 次学习`"
        ></div>
      </div>
    </div>
    
    <!-- 图例 -->
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-morandi-200 flex-shrink-0">
      <span class="text-xs text-morandi-600">Less</span>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-morandi-200 rounded-sm"></div>
        <div v-for="level in 4" :key="level" class="w-3 h-3 rounded-sm" :class="getActivityClass({ count: level * 2 })"></div>
      </div>
      <span class="text-xs text-morandi-600">More</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ActivityData {
  date: string
  count: number
}

// 月份标签
const months = ['3月', '4月', '5月', '6月']

// 生成模拟的活跃度数据 (20周 x 7天 = 140天)
const activityData = computed((): ActivityData[] => {
  const data: ActivityData[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 139) // 140天前
  
  for (let i = 0; i < 140; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    // 生成随机活跃度数据
    let count = 0
    const random = Math.random()
    if (random > 0.7) count = Math.floor(Math.random() * 8) + 1
    else if (random > 0.4) count = Math.floor(Math.random() * 3) + 1
    
    data.push({
      date: currentDate.toLocaleDateString('zh-CN'),
      count
    })
  }
  
  return data
})

// 根据活跃度获取对应的样式类
const getActivityClass = (activity: { count: number }) => {
  if (activity.count === 0) return 'bg-morandi-200'
  if (activity.count <= 2) return 'bg-sage-200'
  if (activity.count <= 4) return 'bg-sage-300'
  if (activity.count <= 6) return 'bg-sage-400'
  return 'bg-sage-500'
}
</script>

<style scoped>
.grid-cols-20 {
  grid-template-columns: repeat(20, minmax(0, 1fr));
}
</style> 