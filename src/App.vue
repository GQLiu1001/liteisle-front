<template>
  <!-- 登录页面 - 全屏显示 -->
  <div v-if="route.path === '/login'" class="h-screen bg-liteisle-bg">
    <router-view />
  </div>
  
  <!-- 主应用界面 - 带侧边栏和顶栏 -->
  <div v-else class="h-screen bg-liteisle-bg flex overflow-hidden">
    <!-- 左侧导航栏 -->
    <Sidebar v-if="uiStore.isSidebarVisible" />
    
    <!-- 固定顶栏 -->
    <Topbar />
    
    <!-- 主内容区域 -->
    <main 
      :class="[
        'flex-1 pt-[80px] bg-liteisle-bg rounded-tr-[40px] rounded-br-[40px] overflow-hidden transition-all duration-300',
        uiStore.isSidebarVisible ? 'ml-[150px]' : 'ml-0'
      ]"
    >
      <router-view />
    </main>
    
    <!-- 底部音乐栏 - 独立浮动 -->
    <MusicBar />
  </div>

  <Toaster :toast-options="{
    style: { background: 'white', color: '#333', border: '1px solid #E5E7EB' },
    class: 'my-toast-class',
  }" rich-colors close-button position="top-center" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'
import MusicBar from '@/components/MusicBar.vue'
import { useUIStore } from '@/store/UIStore'
import { Toaster } from 'vue-sonner'

const route = useRoute()
const uiStore = useUIStore()
</script>

<style>
/* 全局字体和基础样式 */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 