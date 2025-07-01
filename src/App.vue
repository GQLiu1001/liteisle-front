<template>
  <!-- 登录页面 - 全屏显示 -->
  <div v-if="route.path === '/login'" class="h-screen bg-liteisle-bg">
    <router-view />
  </div>
  
  <!-- 主应用界面 - 带侧边栏和顶栏 -->
  <div v-else class="h-screen bg-liteisle-bg flex overflow-hidden">
    <!-- 左侧导航栏 -->
    <Sidebar />
    
    <!-- 固定顶栏 -->
    <Topbar />
    
    <!-- 主内容区域 -->
    <main class="flex-1 ml-[150px] pt-[80px] bg-liteisle-bg rounded-r-[40px] overflow-hidden">
      <router-view />
    </main>
    
    <!-- 底部音乐栏 - 独立浮动 -->
    <MusicBar />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'
import MusicBar from '@/components/MusicBar.vue'

const route = useRoute()
</script> 