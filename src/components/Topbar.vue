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
            @click="goToAccountSettings"
            class="w-full px-4 py-2 hover:bg-morandi-50 flex items-center justify-center gap-2 text-morandi-700 hover:text-teal-600 transition-colors"
          >
            <Settings :size="16" />
            <span>详情</span>
          </button>
          <button 
            @click="handleLogout"
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PenTool, User, Minus, Square, X, LogOut, Settings } from 'lucide-vue-next'
import { useFocusStore } from '@/store/FocusStore'
import { useUIStore } from '@/store/UIStore'
import { useAuthStore } from '@/store/AuthStore'
import { useSettingsStore } from '@/store/SettingsStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const focusStore = useFocusStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
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

// 跳转到账户设置
const goToAccountSettings = () => {
  // 先关闭菜单
  showUserMenu.value = false
  
  // 设置当前分类为账户与云盘
  settingsStore.setCurrentCategoryId('account')
  
  // 使用 nextTick 确保菜单关闭后再跳转
  nextTick(() => {
    router.push({ name: 'settings' })
  })
}

// 退出登录
const handleLogout = async () => {
  try {
    // 先关闭菜单
    showUserMenu.value = false
    
    // 调用认证存储的注销方法
    await authStore.logout()
    
    // 使用 nextTick 确保菜单关闭后再跳转
    nextTick(() => {
      router.push({ name: 'login' })
    })
  } catch (error) {
    console.error('注销失败:', error)
  }
}

// 处理全局点击事件，关闭菜单
const handleClickOutside = () => {
  showUserMenu.value = false
}

// 组件挂载时添加全局点击监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 监听路由变化，自动关闭菜单
watch(route, () => {
  showUserMenu.value = false
})

// 组件卸载时移除监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 窗口控制函数
const minimizeWindow = () => {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    ;(window as any).electronAPI.minimizeWindow()
  }
}

const maximizeWindow = () => {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    ;(window as any).electronAPI.maximizeWindow()
  }
}

const closeWindow = () => {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    ;(window as any).electronAPI.closeWindow()
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