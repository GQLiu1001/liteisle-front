<template>
  <div class="h-full bg-transparent flex flex-col overflow-hidden select-none">
    <!-- 使用与网盘页面相同的高度计算方式 -->
    <div class="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 min-h-0">
      <div class="max-w-7xl mx-auto w-full h-[calc(100vh-12rem)] flex flex-col min-h-0">
        <!-- 顶部区域 - 问候语卡片和学习卡片响应式布局 -->
        <div class="flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-6 mb-4 lg:mb-6 flex-shrink-0">
          <!-- 左侧 - 问候语卡片 -->
          <div class="flex-1 min-w-0 flex">
            <div class="card w-full flex flex-col justify-center relative overflow-hidden">
              <!-- 问候语和励志语 -->
              <div class="flex flex-col justify-center z-10 relative">
                <h2 class="text-2xl lg:text-3xl font-bold text-morandi-900 mb-4">下午好！Zen</h2>
                <!-- 励志语区域 -->
                <div class="flex justify-start">
                  <div class="bg-transparent text-gray-900 text-2xl lg:text-3xl font-bold">
                    <div class="text-left leading-relaxed">
                      "{{ currentMotivationalQuotes[0] }}"
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 右下角图片 -->
              <div class="absolute bottom-4 right-4 w-24 h-24 lg:w-32 lg:h-32 opacity-80">
                <img 
                  src="/cardpic/cardpic.png" 
                  alt="Card decoration" 
                  class="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          <!-- 右侧 - 学习卡片 响应式宽度 -->
          <div class="w-full lg:w-[320px] flex-shrink-0 flex">
            <StudyCard />
          </div>
        </div>
        
        <!-- 主内容区域 - 弹性布局，防截断 -->
        <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden">
          <!-- 岛屿卡片 - 弹性高度，不会被截断，增加最小宽度控制 -->
          <div class="flex-1 min-h-[200px] min-w-[320px] flex">
            <IsleCard />
          </div>
          
          <!-- 专注记录卡片 - 弹性高度，不会被截断，确保固定宽度 -->
          <div class="flex-1 lg:flex-none lg:w-[360px] min-h-[200px] min-w-[320px] flex">
            <ActivityGrid />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StudyCard from '@/components/cards/StudyCard.vue'
import IsleCard from '@/components/cards/IsleCard.vue'
import ActivityGrid from '@/components/cards/ActivityGrid.vue'

// 励志语数组
const motivationalQuotes = [
  '今天的努力，是明天的收获',
  '专注当下，成就未来',
  '每一次坚持，都是成长的印记',
  '静心致远，专注致胜',
  '小步前进，终达千里',
  '专注是最好的投资',
  '今日事，今日毕',
  '心无旁骛，方能致远',
  '持之以恒，水滴石穿',
  '专注的力量，无可限量',
  '每一分专注，都值得珍惜',
  '静下心来，世界更清晰',
  '专注是通往成功的捷径',
  '用心做事，必有收获',
  '专注当下，拥抱未来',
  '坚持不懈，梦想成真',
  '专注让平凡变得不凡',
  '一心一意，事半功倍',
  '专注是最美的姿态',
  '今天的专注，明天的骄傲'
]

// 当前显示的励志语
const currentMotivationalQuotes = ref<string[]>([])

// 随机选择一句励志语
const selectRandomQuotes = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
  currentMotivationalQuotes.value = [motivationalQuotes[randomIndex]]
}

// 组件挂载时选择励志语
onMounted(() => {
  selectRandomQuotes()
  
  // 每30秒更换一次励志语
  setInterval(selectRandomQuotes, 30000)
})
</script> 