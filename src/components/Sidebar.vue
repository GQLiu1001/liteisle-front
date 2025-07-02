<template>
  <aside class="fixed left-0 top-0 w-[150px] h-full bg-liteisle-sidebar flex flex-col z-50">
    <!-- Logo -->
    <div class="pt-8 pb-4 px-6">
      <img src="/titlepic.png" alt="Liteisle" class="w-full h-auto max-w-[150px] object-contain" />
    </div>
    
    <!-- Navigation Items - Centered vertically -->
    <div class="flex flex-col gap-3 px-4 flex-1 justify-center">
      <div v-for="item in navItems" :key="item.name" class="relative">
        <router-link
          :to="item.path"
          class="sidebar-item"
          :class="{ active: route.name === item.name }"
        >
          <component :is="item.icon" :size="28" />
          <span class="text-sm font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Home, HardDrive, Music, FileText, Settings } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()

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
    icon: HardDrive
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