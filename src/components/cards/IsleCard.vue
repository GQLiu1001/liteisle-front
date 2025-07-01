<template>
  <div class="card h-full flex flex-col min-h-0 overflow-hidden w-full">
    <!-- 标题和全局切换按钮 -->
    <div 
      class="flex items-center mb-6 lg:mb-8 flex-shrink-0 justify-between"
    >
      <button 
        @click="prev"
        class="w-8 h-8 lg:w-10 lg:h-10 bg-morandi-100 hover:bg-morandi-200 rounded-full flex items-center justify-center transition-all duration-200"
      >
        <ChevronLeft :size="20" class="text-morandi-600" />
      </button>
      
      <h3 class="text-xl lg:text-2xl font-bold text-morandi-900">净化岛屿</h3>
      
      <button 
        @click="next"
        class="w-8 h-8 lg:w-10 lg:h-10 bg-morandi-100 hover:bg-morandi-200 rounded-full flex items-center justify-center transition-all duration-200"
      >
        <ChevronRight :size="20" class="text-morandi-600" />
      </button>
    </div>
    
    <!-- 主内容区域: 三段式响应式布局 -->
    <div class="flex-1 flex items-center justify-center min-h-0 mb-4 lg:mb-6">

      <!-- A. 超大屏 (>=1280px): 单岛屿轮播 -->
      <div class="w-full h-full items-center justify-center hidden xl:flex">
        <img 
          :src="singleIsleImage" 
          :alt="`岛屿 ${currentSingleIsleIndex + 1}`"
          class="max-w-full max-h-full object-contain transition-all duration-300 rounded-lg"
          @error="handleImageError"
        />
      </div>

      <!-- B. 中等屏幕 (1024px - 1279px): 三岛屿静态分页显示 -->
      <div class="w-full h-full hidden lg:flex xl:hidden items-center justify-center">
        <div class="flex justify-around items-center w-full">
          <div 
            v-for="isle in threeIslesForCurrentPage" :key="`three-${isle.name}`"
            class="flex flex-col items-center gap-2 p-2"
          >
            <div class="w-24 h-24 bg-morandi-50 rounded-xl flex items-center justify-center p-2">
              <img :src="`/islepic/${isle.image}`" :alt="isle.name" class="max-w-full max-h-full object-contain" @error="handleImageError" />
            </div>
            <p class="text-sm text-morandi-800 text-center font-medium">{{ isle.name }}</p>
          </div>
          <!-- 填充空白项，确保布局稳定 -->
          <template v-if="threeIslesForCurrentPage.length < 3">
            <div v-for="i in (3 - threeIslesForCurrentPage.length)" :key="`placeholder-${i}`" class="w-24 p-2"></div>
          </template>
        </div>
      </div>

      <!-- C. 小屏幕 (<1024px): 网格视图 -->
      <div class="grid grid-cols-3 sm:grid-cols-4 lg:hidden gap-4 w-full h-full overflow-y-auto">
        <div v-for="(isle) in isles" :key="`grid-${isle.name}`" class="flex flex-col items-center gap-2 p-2 rounded-lg">
          <div class="w-20 h-20 md:w-24 md:h-24 bg-morandi-50 rounded-xl flex items-center justify-center p-2">
            <img :src="`/islepic/${isle.image}`" :alt="isle.name" class="max-w-full max-h-full object-contain" @error="handleImageError" />
          </div>
          <p class="text-xs md:text-sm text-morandi-800 text-center font-medium">{{ isle.name }}</p>
        </div>
      </div>
    </div>
    
    <!-- 数量显示 -->
    <div class="text-center flex-shrink-0">
      <p class="text-base lg:text-lg font-bold text-morandi-900">数量：{{ isleCount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useFocusStore } from '@/store/FocusStore'
import { storeToRefs } from 'pinia'

const focusStore = useFocusStore()
const { isleCount } = storeToRefs(focusStore)

const isles = [
  { name: '绿意盎然', image: 'isle1.png' }, { name: '珊瑚礁石', image: 'isle2.png' },
  { name: '雪山之巅', image: 'isle3.png' }, { name: '沙漠绿洲', image: 'isle4.png' },
  { name: '樱花飞舞', image: 'isle5.png' }, { name: '极光之岛', image: 'isle6.png' },
  { name: '火山之心', image: 'isle7.png' }, { name: '水晶洞穴', image: 'isle8.png' },
]

// --- 统一状态和控制逻辑 ---
const currentScreenMode = ref<'single' | 'three' | 'grid'>('single')
const currentSingleIsleIndex = ref(0)
const threeIsleCurrentPage = ref(0)
const maxThreeIslePage = computed(() => Math.ceil(isles.length / 3) - 1)

// A. 单岛屿轮播
const singleIsleImage = computed(() => `/islepic/${isles[currentSingleIsleIndex.value]?.image}`)
const nextSingleIsle = () => { currentSingleIsleIndex.value = (currentSingleIsleIndex.value + 1) % isles.length }
const prevSingleIsle = () => { currentSingleIsleIndex.value = (currentSingleIsleIndex.value - 1 + isles.length) % isles.length }

// B. 三岛屿静态分页
const threeIslesForCurrentPage = computed(() => {
  const start = threeIsleCurrentPage.value * 3;
  const end = start + 3;
  return isles.slice(start, end);
})
const nextThreeIslePage = () => { threeIsleCurrentPage.value = (threeIsleCurrentPage.value + 1) % (maxThreeIslePage.value + 1) }
const prevThreeIslePage = () => { threeIsleCurrentPage.value = (threeIsleCurrentPage.value - 1 + (maxThreeIslePage.value + 1)) % (maxThreeIslePage.value + 1) }

// 统一的切换函数
const next = () => {
  if (currentScreenMode.value === 'single') nextSingleIsle()
  else if (currentScreenMode.value === 'three') nextThreeIslePage()
}
const prev = () => {
  if (currentScreenMode.value === 'single') prevSingleIsle()
  else if (currentScreenMode.value === 'three') prevThreeIslePage()
}

// 检测当前屏幕模式
const checkScreenMode = () => {
  if (typeof window === 'undefined') return
  if (window.innerWidth >= 1280) {
    currentScreenMode.value = 'single'
  } else if (window.innerWidth >= 1024) {
    currentScreenMode.value = 'three'
  } else {
    currentScreenMode.value = 'grid'
  }
}

onMounted(() => {
  checkScreenMode()
  window.addEventListener('resize', checkScreenMode)
})
onUnmounted(() => window.removeEventListener('resize', checkScreenMode))


// 图片加载错误处理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Ccircle cx="60" cy="60" r="50" fill="url(%23gradient1)" /%3E%3Cdefs%3E%3ClinearGradient id="gradient1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FFB6C1;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23DDA0DD;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2387CEEB;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx="60" cy="30" rx="35" ry="12" fill="%23FF6B6B" opacity="0.8" /%3E%3Cellipse cx="60" cy="85" rx="25" ry="12" fill="%237CB342" /%3E%3Crect x="59" y="72" width="2" height="15" fill="%238D6E63" /%3E%3Ccircle cx="60" cy="69" r="4" fill="%2366BB6A" /%3E%3Ctext x="60" y="100" text-anchor="middle" fill="%23666" font-size="8"%3E岛屿%3C/text%3E%3C/svg%3E'
}
</script> 