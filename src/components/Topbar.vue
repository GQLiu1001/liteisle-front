<template>
  <header 
    :class="[
      'fixed top-0 right-0 h-[80px] bg-transparent flex items-center justify-between px-8 py-6 draggable-area z-10 transition-all duration-300 select-none',
      uiStore.isSidebarVisible ? 'left-[150px]' : 'left-0'
    ]"
  >
    <!-- 左侧 - 开始专注按钮 -->
    <div>
      <button 
        @click="toggleFocus"
        :class="[
          'btn-primary flex items-center gap-3 px-8 py-3 text-lg',
          isFocusing ? 'from-red-500 to-red-600' : ''
        ]"
      >
        <PenTool :size="20" />
        <span>{{ isFocusing ? '停止专注' : '开始专注' }}</span>
      </button>
    </div>

    <!-- 右侧 - 用户头像和窗口控制 -->
    <div class="flex items-center gap-4">
      <!-- 用户头像下拉菜单 -->
      <div class="relative user-menu" @click="toggleUserMenu">
        <div class="w-10 h-10 rounded-full bg-white border-2 border-morandi-400 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-colors">
          <User :size="20" class="text-morandi-600" />
        </div>
        
        <!-- 下拉菜单 -->
        <div 
          v-if="showUserMenu"
          class="absolute left-1/2 -translate-x-1/2 top-12 w-32 bg-white rounded-lg shadow-lg border border-morandi-200 py-2 z-50"
        >
          <button 
            @click="logout"
            class="w-full px-4 py-2 hover:bg-morandi-50 flex items-center justify-center gap-2 text-morandi-700 hover:text-red-600 transition-colors"
          >
            <LogOut :size="16" />
            <span>注销</span>
          </button>
        </div>
      </div>

      <!-- 窗口控制按钮 -->
      <div class="flex items-center gap-2">
        <button @click="minimizeWindow" class="topbar-control">
          <Minus :size="16" />
        </button>
        <button @click="maximizeWindow" class="topbar-control">
          <Square :size="14" />
        </button>
        <button @click="closeWindow" class="topbar-control hover:bg-red-100 hover:text-red-600">
          <X :size="16" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PenTool, User, Minus, Square, X, LogOut } from 'lucide-vue-next'
import { useFocusStore } from '@/store/FocusStore'
import { useUIStore } from '@/store/UIStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const focusStore = useFocusStore()
const uiStore = useUIStore()
const { isFocusing } = storeToRefs(focusStore)

// 用户菜单状态
const showUserMenu = ref(false)

const toggleFocus = () => {
  if (isFocusing.value) {
    focusStore.stopFocus()
  } else {
    focusStore.startFocus()
  }
}

// 用户菜单交互
const toggleUserMenu = (event: Event) => {
  event.stopPropagation()
  showUserMenu.value = !showUserMenu.value
}

// 退出登录
const logout = () => {
  // 清空本地存储
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  
  // 关闭菜单
  showUserMenu.value = false
  
  // 跳转到登录页
  router.push({ name: 'login' })
}

// 处理全局点击事件，关闭菜单
const handleClickOutside = () => {
  showUserMenu.value = false
}

// 组件挂载时添加全局点击监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 检查是否在 Electron 环境中
const isElectron = () => {
  return typeof window !== 'undefined' && (window as any).process && (window as any).process.type
}

// 窗口控制函数 (Electron IPC 调用)
const minimizeWindow = () => {
  if (isElectron()) {
    const { ipcRenderer } = (window as any).require('electron')
    ipcRenderer.send('window-minimize')
  } else {
    console.log('最小化窗口')
  }
}

const maximizeWindow = () => {
  if (isElectron()) {
    const { ipcRenderer } = (window as any).require('electron')
    ipcRenderer.send('window-maximize')
  } else {
    console.log('最大化窗口')
  }
}

const closeWindow = () => {
  if (isElectron()) {
    const { ipcRenderer } = (window as any).require('electron')
    ipcRenderer.send('window-close')
  } else {
    console.log('关闭窗口')
  }
}
</script>

<style scoped>
.draggable-area {
  -webkit-app-region: drag;
}

.draggable-area button {
  -webkit-app-region: no-drag;
}

.draggable-area .topbar-control {
  -webkit-app-region: no-drag;
}

.draggable-area .user-menu {
  -webkit-app-region: no-drag;
}
</style> 