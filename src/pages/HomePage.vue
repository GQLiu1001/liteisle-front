<template>
  <div class="h-full bg-transparent flex flex-col overflow-hidden select-none">
    <!-- 使用与网盘页面相同的高度计算方式 -->
    <div class="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 min-h-0">
      <div class="max-w-7xl mx-auto w-full h-[calc(100vh-12rem)] flex flex-col min-h-0">
        <!-- 顶部区域 - 问候语和学习卡片响应式布局 -->
        <div class="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-4 lg:mb-6 flex-shrink-0">
          <!-- 左侧 - 问候语和搜索栏 -->
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <h2 class="text-2xl lg:text-3xl font-bold text-morandi-900 mb-4">下午好！Zen</h2>
            <!-- 搜索栏 -->
            <div class="relative">
              <input 
                type="text" 
                placeholder="搜索网络资源/听说专注有概率会净化某片岛屿/专注达30分钟视为一次签到"
                class="w-full px-4 lg:px-6 py-3 lg:py-4 bg-white rounded-full border border-morandi-300 text-morandi-800 placeholder-morandi-500 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm lg:text-base select-text"
              />
              <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-morandi-100 rounded-full flex items-center justify-center hover:bg-morandi-200 transition-colors">
                <X :size="14" class="lg:hidden" />
                <X :size="16" class="hidden lg:block" />
              </button>
            </div>
          </div>
          
          <!-- 右侧 - 学习卡片 响应式宽度 -->
          <div class="w-full lg:w-[320px] flex-shrink-0">
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
import { X } from 'lucide-vue-next'
import StudyCard from '@/components/cards/StudyCard.vue'
import IsleCard from '@/components/cards/IsleCard.vue'
import ActivityGrid from '@/components/cards/ActivityGrid.vue'
</script> 