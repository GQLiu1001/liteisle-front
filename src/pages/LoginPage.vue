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

      <!-- 表单容器 -->
      <div class="card p-8">
        <!-- 标签导航 -->
        <div class="flex justify-center mb-8">
          <div class="bg-morandi-100 p-1 rounded-xl inline-flex">
            <button
              @click="activeTab = 'login'"
              :class="[
                'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === 'login' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-morandi-600 hover:text-morandi-800'
              ]"
            >
              登录
            </button>
            <button
              @click="activeTab = 'register'"
              :class="[
                'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === 'register' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-morandi-600 hover:text-morandi-800'
              ]"
            >
              注册
            </button>
            <button
              @click="activeTab = 'forgot'"
              :class="[
                'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === 'forgot' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-morandi-600 hover:text-morandi-800'
              ]"
            >
              忘记密码
            </button>
          </div>
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名输入框 -->
          <div>
            <label for="login-username" class="block text-sm font-medium text-morandi-700 mb-2">用户名</label>
            <input
              id="login-username"
              v-model="loginForm.username"
              type="text"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 密码输入框 -->
          <div>
            <label for="login-password" class="block text-sm font-medium text-morandi-700 mb-2">密码</label>
            <input
              id="login-password"
              v-model="loginForm.password"
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
              v-model="loginForm.remember"
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

          <!-- 底部提示 -->
          <div class="text-center">
            <p class="text-sm text-morandi-600 select-text">
              演示账号：admin / 123456
            </p>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用户名输入框 -->
          <div>
            <label for="register-username" class="block text-sm font-medium text-morandi-700 mb-2">用户名</label>
            <input
              id="register-username"
              v-model="registerForm.username"
              type="text"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 邮箱输入框 -->
          <div>
            <label for="register-email" class="block text-sm font-medium text-morandi-700 mb-2">邮箱</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入邮箱地址"
            />
          </div>

          <!-- 密码输入框 -->
          <div>
            <label for="register-password" class="block text-sm font-medium text-morandi-700 mb-2">密码</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入密码"
            />
          </div>

          <!-- 邮箱验证码 -->
          <div>
            <label for="register-code" class="block text-sm font-medium text-morandi-700 mb-2">邮箱验证码</label>
            <div class="flex gap-3">
              <input
                id="register-code"
                v-model="registerForm.verificationCode"
                type="text"
                required
                class="flex-1 px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
                placeholder="请输入验证码"
              />
              <button
                type="button"
                @click="sendRegisterCode"
                :disabled="isCodeLoading || registerCodeCountdown > 0 || !registerForm.email"
                class="px-4 py-3 bg-morandi-500 hover:bg-morandi-600 disabled:bg-morandi-300 text-white text-sm rounded-xl transition-colors duration-200"
              >
                {{ registerCodeCountdown > 0 ? `${registerCodeCountdown}s` : (isCodeLoading ? '发送中...' : '获取验证码') }}
              </button>
            </div>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-morandi-300 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <Loader2 v-if="isLoading" :size="20" class="animate-spin mr-2" />
            {{ isLoading ? '注册中...' : '注册账号' }}
          </button>
        </form>

        <!-- 忘记密码表单 -->
        <form v-if="activeTab === 'forgot'" @submit.prevent="handleForgotPassword" class="space-y-6">
          <!-- 用户名输入框 -->
          <div>
            <label for="forgot-username" class="block text-sm font-medium text-morandi-700 mb-2">用户名</label>
            <input
              id="forgot-username"
              v-model="forgotForm.username"
              type="text"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 邮箱输入框 -->
          <div>
            <label for="forgot-email" class="block text-sm font-medium text-morandi-700 mb-2">邮箱</label>
            <input
              id="forgot-email"
              v-model="forgotForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
              placeholder="请输入邮箱地址"
            />
          </div>

          <!-- 邮箱验证码 -->
          <div>
            <label for="forgot-code" class="block text-sm font-medium text-morandi-700 mb-2">邮箱验证码</label>
            <div class="flex gap-3">
              <input
                id="forgot-code"
                v-model="forgotForm.verificationCode"
                type="text"
                required
                class="flex-1 px-4 py-3 border border-morandi-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all select-text"
                placeholder="请输入验证码"
              />
              <button
                type="button"
                @click="sendForgotCode"
                :disabled="isCodeLoading || forgotCodeCountdown > 0 || !forgotForm.email"
                class="px-4 py-3 bg-morandi-500 hover:bg-morandi-600 disabled:bg-morandi-300 text-white text-sm rounded-xl transition-colors duration-200"
              >
                {{ forgotCodeCountdown > 0 ? `${forgotCodeCountdown}s` : (isCodeLoading ? '发送中...' : '获取验证码') }}
              </button>
            </div>
          </div>

          <!-- 重置密码按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-morandi-300 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <Loader2 v-if="isLoading" :size="20" class="animate-spin mr-2" />
            {{ isLoading ? '重置中...' : '重置密码' }}
          </button>

          <!-- 提示信息 -->
          <div class="text-center">
            <p class="text-sm text-morandi-600">
              重置密码后，新密码将发送到您的邮箱
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2, Minus, Square, X } from 'lucide-vue-next'

const router = useRouter()

// 活跃标签页
const activeTab = ref<'login' | 'register' | 'forgot'>('login')

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  verificationCode: ''
})

const forgotForm = reactive({
  username: '',
  email: '',
  verificationCode: ''
})

// 加载状态
const isLoading = ref(false)
const isCodeLoading = ref(false)

// 验证码倒计时
const registerCodeCountdown = ref(0)
const forgotCodeCountdown = ref(0)

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

// 处理登录
const handleLogin = async () => {
  isLoading.value = true
  
  try {
    // 模拟登录请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 简单的演示登录逻辑
    if (loginForm.username === 'admin' && loginForm.password === '123456') {
      // 登录成功，保存登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', loginForm.username)
      
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

// 处理注册
const handleRegister = async () => {
  isLoading.value = true
  
  try {
    // 模拟注册请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 简单的演示注册逻辑
    if (registerForm.verificationCode === '123456') {
      alert(`注册成功！\n用户名：${registerForm.username}\n邮箱：${registerForm.email}\n请使用新账号登录`)
      
      // 注册成功后切换到登录页面
      activeTab.value = 'login'
      loginForm.username = registerForm.username
      
      // 清空注册表单
      Object.assign(registerForm, {
        username: '',
        email: '',
        password: '',
        verificationCode: ''
      })
    } else {
      alert('验证码错误！\n演示验证码：123456')
    }
  } catch (error) {
    console.error('注册失败:', error)
    alert('注册失败，请重试！')
  } finally {
    isLoading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = async () => {
  isLoading.value = true
  
  try {
    // 模拟重置密码请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 简单的演示重置密码逻辑
    if (forgotForm.verificationCode === '123456') {
      alert(`密码重置成功！\n新密码已发送到：${forgotForm.email}\n演示新密码：newpass123`)
      
      // 重置成功后切换到登录页面
      activeTab.value = 'login'
      loginForm.username = forgotForm.username
      
      // 清空忘记密码表单
      Object.assign(forgotForm, {
        username: '',
        email: '',
        verificationCode: ''
      })
    } else {
      alert('验证码错误！\n演示验证码：123456')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    alert('重置密码失败，请重试！')
  } finally {
    isLoading.value = false
  }
}

// 发送注册验证码
const sendRegisterCode = async () => {
  if (!registerForm.email) {
    alert('请先输入邮箱地址')
    return
  }
  
  isCodeLoading.value = true
  
  try {
    // 模拟发送验证码延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert(`验证码已发送到：${registerForm.email}\n演示验证码：123456`)
    
    // 开始倒计时
    registerCodeCountdown.value = 60
    const timer = setInterval(() => {
      registerCodeCountdown.value--
      if (registerCodeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert('发送验证码失败，请重试！')
  } finally {
    isCodeLoading.value = false
  }
}

// 发送忘记密码验证码
const sendForgotCode = async () => {
  if (!forgotForm.email) {
    alert('请先输入邮箱地址')
    return
  }
  
  isCodeLoading.value = true
  
  try {
    // 模拟发送验证码延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert(`验证码已发送到：${forgotForm.email}\n演示验证码：123456`)
    
    // 开始倒计时
    forgotCodeCountdown.value = 60
    const timer = setInterval(() => {
      forgotCodeCountdown.value--
      if (forgotCodeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert('发送验证码失败，请重试！')
  } finally {
    isCodeLoading.value = false
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