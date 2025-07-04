<template>
  <div class="min-h-screen bg-liteisle-bg flex items-center justify-center select-none">
    <!-- 可拖拽的标题栏区域 - 登录页面 -->
    <div class="fixed top-0 left-0 w-full h-16 flex items-center justify-end px-4 z-50 draggable-area">
      <!-- 窗口控制按钮 -->
      <div class="flex items-center gap-2">
        <button @click="minimizeWindow" class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 hover:bg-black/10 cursor-pointer">
          <Minus :size="16" />
        </button>
        <button @click="maximizeWindow" class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 hover:bg-black/10 cursor-pointer">
          <Square :size="14" />
        </button>
        <button @click="closeWindow" class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 hover:bg-red-100 hover:text-red-600 cursor-pointer">
          <X :size="16" />
        </button>
      </div>
    </div>
    
    <div class="w-full max-w-md">
      <!-- Logo区域 -->
      <div class="text-center mb-12">
        <img src="/titlepic.png" alt="Liteisle" class="h-20 mx-auto mb-6" />
        <h1 class="text-2xl font-light text-morandi-900 mb-2">欢迎来到 Liteisle</h1>
        <p class="text-morandi-600">专注学习，净化心灵</p>
      </div>

      <!-- 登录表单 -->
      <div class="card p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名输入框 -->
          <div>
            <label for="username" class="block text-sm font-medium text-morandi-700 mb-2">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 密码输入框 -->
          <div>
            <label for="password" class="block text-sm font-medium text-morandi-700 mb-2">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入密码"
            />
          </div>

          <!-- 记住登录状态 -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-morandi-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-morandi-700">记住登录状态</label>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-morandi-300 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <Loader2 v-if="isLoading" :size="20" class="animate-spin mr-2" />
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 底部提示 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-morandi-600 select-text">
            演示账号：admin / 123456
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2, Minus, Square, X } from 'lucide-vue-next'

const router = useRouter()

// 表单数据
const form = reactive({
  username: '',
  password: '',
  remember: false
})

const isLoading = ref(false)

// 窗口控制函数
const minimizeWindow = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      console.log('最小化窗口...')
      ;(window as any).electronAPI.minimizeWindow()
    } else {
      console.log('未检测到 Electron 环境 - 最小化窗口')
    }
  } catch (error) {
    console.error('最小化窗口失败:', error)
  }
}

const maximizeWindow = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      console.log('最大化/还原窗口...')
      ;(window as any).electronAPI.maximizeWindow()
    } else {
      console.log('未检测到 Electron 环境 - 最大化窗口')
    }
  } catch (error) {
    console.error('最大化窗口失败:', error)
  }
}

const closeWindow = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      console.log('关闭窗口...')
      ;(window as any).electronAPI.closeWindow()
    } else {
      console.log('未检测到 Electron 环境 - 关闭窗口')
    }
  } catch (error) {
    console.error('关闭窗口失败:', error)
  }
}

// 处理登录
const handleLogin = async () => {
  isLoading.value = true
  
  try {
    // 模拟登录请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 简单的演示登录逻辑
    if (form.username === 'admin' && form.password === '123456') {
      // 登录成功，保存登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', form.username)
      
      // 跳转到首页
      router.push('/home')
    } else {
      alert('用户名或密码错误！\n请使用：admin / 123456')
    }
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试！')
  } finally {
    isLoading.value = false
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
</style>