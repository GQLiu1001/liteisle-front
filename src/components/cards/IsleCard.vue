<template>
  <div class="card h-full flex flex-col">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold text-morandi-900">净化岛屿</h3>
    </div>
    
    <!-- 岛屿轮播区域 -->
    <div class="relative flex-1 flex flex-col mb-6">
      <!-- 岛屿图片 -->
      <div class="w-full flex-1 flex items-center justify-center mb-4">
        <img 
          :src="currentIsleImage" 
          :alt="`岛屿 ${currentIsleIndex + 1}`"
          class="max-w-full max-h-full object-contain transition-all duration-300 rounded-lg"
          @error="handleImageError"
        />
      </div>
      
      <!-- 左右切换按钮 -->
      <button 
        @click="prevIsle"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md"
      >
        <ChevronLeft :size="20" />
      </button>
      
      <button 
        @click="nextIsle"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md"
      >
        <ChevronRight :size="20" />
      </button>
    </div>
    
    <!-- 岛屿数量 -->
    <div class="text-center">
      <p class="text-xl font-bold text-morandi-900">数量：{{ isleCount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useFocusStore } from '@/store/FocusStore'
import { storeToRefs } from 'pinia'

const focusStore = useFocusStore()
const { isleCount, currentIsleIndex } = storeToRefs(focusStore)

// 岛屿数据
const isles = [
  { 
    name: '绿意盎然', 
    description: '充满生机的热带岛屿',
    image: 'isle1.png'
  },
  { 
    name: '珊瑚礁石', 
    description: '美丽的珊瑚海域',
    image: 'isle2.png'
  },
  { 
    name: '雪山之巅', 
    description: '高耸入云的雪山岛',
    image: 'isle3.png'
  },
  { 
    name: '沙漠绿洲', 
    description: '沙漠中的生命奇迹',
    image: 'isle4.png'
  },
  { 
    name: '樱花飞舞', 
    description: '粉色浪漫的樱花岛',
    image: 'isle5.png'
  },
  { 
    name: '极光之岛', 
    description: '神秘的极光景观',
    image: 'isle6.png'
  }
]

// 当前岛屿图片路径
const currentIsleImage = computed(() => {
  return `/islepic/${isles[currentIsleIndex.value].image}`
})

// 切换岛屿
const nextIsle = () => {
  focusStore.nextIsle()
}

const prevIsle = () => {
  focusStore.prevIsle()
}

// 图片加载错误处理 - 显示备用的 SVG 图标
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Ccircle cx="60" cy="60" r="50" fill="url(%23gradient1)" /%3E%3Cdefs%3E%3ClinearGradient id="gradient1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FFB6C1;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23DDA0DD;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2387CEEB;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx="60" cy="30" rx="35" ry="12" fill="%23FF6B6B" opacity="0.8" /%3E%3Cellipse cx="60" cy="85" rx="25" ry="12" fill="%237CB342" /%3E%3Crect x="59" y="72" width="2" height="15" fill="%238D6E63" /%3E%3Ccircle cx="60" cy="69" r="4" fill="%2366BB6A" /%3E%3Ctext x="60" y="100" text-anchor="middle" fill="%23666" font-size="8"%3E岛屿%3C/text%3E%3C/svg%3E'
}
</script> 