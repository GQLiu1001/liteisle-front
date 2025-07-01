<template>
  <div class="h-full bg-transparent flex flex-col overflow-hidden">
    <div class="flex-1 flex flex-col p-4 pb-24 min-h-0">
      <div class="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <!-- 顶部区域 - 问候语和学习卡片并排 -->
        <div class="flex items-center gap-6 mb-6 flex-shrink-0">
          <!-- 左侧 - 问候语和搜索栏 -->
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <h2 class="text-3xl font-bold text-morandi-900 mb-4">下午好！Zen</h2>
            <!-- 搜索栏 -->
            <div class="relative">
              <input 
                type="text" 
                placeholder="搜索网络资源/听说开启专注有概率会净化某片岛屿"
                class="w-full px-6 py-4 bg-white rounded-full border border-morandi-300 text-morandi-800 placeholder-morandi-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-morandi-100 rounded-full flex items-center justify-center hover:bg-morandi-200 transition-colors">
                <X :size="16" />
              </button>
            </div>
          </div>
          
          <!-- 右侧 - 学习卡片 -->
          <div class="w-[320px] flex-shrink-0">
            <StudyCard />
          </div>
        </div>
        
        <!-- 主内容区域 - 2x1 网格，设定固定高度 -->
        <div class="grid grid-cols-2 gap-6 h-[400px]">
          <!-- 左侧 - 岛屿卡片 -->
          <div class="h-full">
            <IsleCard />
          </div>
          
          <!-- 右侧 - 活跃度网格 -->
          <div class="h-full">
            <ActivityGrid />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import StudyCard from '@/components/cards/StudyCard.vue'
import IsleCard from '@/components/cards/IsleCard.vue'
import ActivityGrid from '@/components/cards/ActivityGrid.vue'
</script> 