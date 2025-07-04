<template>
  <aside class="fixed left-0 top-0 w-[150px] h-full bg-liteisle-sidebar flex flex-col z-50 select-none">
    <!-- Logo -->
    <div class="pt-6 pb-6 px-4 flex justify-center">
      <div class="relative">
        <img 
          src="/titlepic.png" 
          alt="Liteisle" 
          class="w-20 h-20 object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-300 hover:scale-105" 
        />
        <!-- 可选：添加背景光环效果 -->
        <div class="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-2xl -z-10 blur-xl"></div>
      </div>
    </div>
    
    <!-- Navigation Items - Centered vertically -->
    <div class="flex flex-col gap-3 px-4 flex-1 justify-center">
      <div v-for="item in navItems" :key="item.name" class="relative">
        <router-link
          :to="item.path"
          class="sidebar-item"
          :class="{ 
            active: route.name === item.name,
            'has-active-tasks': item.name === 'transfer' && hasActiveTasks
          }"
        >
          <component :is="item.icon" :size="28" />
          <span class="text-sm font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Home, Cloud, Music, FileText, Settings, CloudLightning } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useTransferStore } from '../store/TransferStore'

const route = useRoute()
const transferStore = useTransferStore()

// 检查是否有活跃的传输任务
const hasActiveTasks = computed(() => {
  return transferStore.progressingTasks.length > 0
})

const navItems = [
  {
    name: 'home',
    path: '/home',
    label: '首页',
    icon: Home
  },
  {
    name: 'drive',
    path: '/drive',
    label: '云盘',
    icon: Cloud
  },
  {
    name: 'transfer',
    path: '/transfer',
    label: '传输',
    icon: CloudLightning
  },
  {
    name: 'music',
    path: '/music',
    label: '音乐',
    icon: Music
  },
  {
    name: 'docs',
    path: '/docs',
    label: '文档',
    icon: FileText
  },
  {
    name: 'settings',
    path: '/settings',
    label: '设置',
    icon: Settings
  }
]
</script>

<style scoped>
.sidebar-item.has-active-tasks {
  @apply bg-orange-500 text-white;
}

.sidebar-item.has-active-tasks:hover {
  @apply bg-orange-600;
}
</style> 