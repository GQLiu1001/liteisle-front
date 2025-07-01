<template>
  <div class="min-h-full bg-liteisle-bg p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 双栏布局容器 -->
      <div class="flex gap-6 h-[calc(100vh-8rem)]">
        
        <!-- 左侧导航菜单 -->
        <div class="w-64 flex-shrink-0">
          <div class="card h-full">
            <h2 class="text-lg font-bold text-morandi-900 mb-4">系统设置</h2>
            
            <!-- 设置分类导航 -->
            <nav class="space-y-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="currentCategory = category.id"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300',
                  currentCategory === category.id
                    ? 'bg-teal-100 text-teal-700 border-l-4 border-teal-500'
                    : 'hover:bg-morandi-100 text-morandi-700'
                ]"
              >
                <component :is="iconMap[category.id]" :size="20" />
                <div class="flex-1">
                  <div class="font-medium">{{ category.name }}</div>
                  <div class="text-xs text-morandi-500">{{ category.description }}</div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        <!-- 右侧内容显示区 -->
        <div class="flex-1">
          <div class="card h-full overflow-y-auto">
            
            <!-- 通用设置 -->
            <div v-if="currentCategory === 'general'">
              <h3 class="text-xl font-bold text-morandi-900 mb-6">通用设置</h3>
              
              <div class="space-y-6">
                <!-- 开机自启 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">开机自启</h4>
                    <p class="text-sm text-morandi-600">应用在电脑开机时自动运行</p>
                  </div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="settings.launchAtStartup"
                      class="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </div>
                </div>

                <!-- 语言选择 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">语言</h4>
                    <p class="text-sm text-morandi-600">选择界面显示语言</p>
                  </div>
                  <select
                    v-model="settings.language"
                    class="px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                <!-- 默认页面 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">默认页面</h4>
                    <p class="text-sm text-morandi-600">启动应用时默认进入的页面</p>
                  </div>
                  <select
                    v-model="settings.defaultPage"
                    class="px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="home">首页</option>
                    <option value="drive">云盘</option>
                    <option value="music">音乐</option>
                    <option value="docs">文档</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 专注设置 -->
            <div v-else-if="currentCategory === 'focus'">
              <h3 class="text-xl font-bold text-morandi-900 mb-6">专注设置</h3>
              
              <div class="space-y-6">
                <!-- 番茄钟时长 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">专注时长</h4>
                    <p class="text-sm text-morandi-600">设置单次专注的持续时间</p>
                  </div>
                  <select
                    v-model="settings.focusTime"
                    class="px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option :value="15">15 分钟</option>
                    <option :value="25">25 分钟</option>
                    <option :value="45">45 分钟</option>
                    <option :value="60">60 分钟</option>
                  </select>
                </div>

                <!-- 休息时长 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">休息时长</h4>
                    <p class="text-sm text-morandi-600">设置休息时间的持续时间</p>
                  </div>
                  <select
                    v-model="settings.breakTime"
                    class="px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option :value="5">5 分钟</option>
                    <option :value="10">10 分钟</option>
                    <option :value="15">15 分钟</option>
                  </select>
                </div>

                <!-- 提示音效 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">提示音效</h4>
                    <p class="text-sm text-morandi-600">专注完成时的提示音</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      v-model="settings.soundEnabled"
                      class="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <select
                      v-model="settings.soundType"
                      :disabled="!settings.soundEnabled"
                      class="px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="bell">铃声</option>
                      <option value="chime">钟声</option>
                      <option value="notification">通知音</option>
                      <option value="none">无声</option>
                    </select>
                  </div>
                </div>

                <!-- 自动开始下一轮 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">自动开始下一轮</h4>
                    <p class="text-sm text-morandi-600">休息结束后自动开始下一次专注</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="settings.autoNextRound"
                    class="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <!-- 外观设置 -->
            <div v-else-if="currentCategory === 'appearance'">
              <h3 class="text-xl font-bold text-morandi-900 mb-6">外观设置</h3>
              
              <div class="space-y-6">
                <!-- 主题模式 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">主题模式</h4>
                    <p class="text-sm text-morandi-600">选择界面主题</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      v-for="theme in themes"
                      :key="theme.value"
                      @click="settings.themeMode = theme.value"
                      :class="[
                        'px-4 py-2 rounded-lg border transition-colors',
                        settings.themeMode === theme.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-morandi-300 hover:border-morandi-400'
                      ]"
                    >
                      {{ theme.label }}
                    </button>
                  </div>
                </div>

                <!-- 主色调 -->
                <div>
                  <div class="mb-3">
                    <h4 class="font-medium text-morandi-900">主色调</h4>
                    <p class="text-sm text-morandi-600">自定义界面的主题色</p>
                  </div>
                  <div class="flex gap-3">
                    <button
                      v-for="color in accentColors"
                      :key="color.value"
                      @click="settings.accentColor = color.value"
                      :class="[
                        'w-10 h-10 rounded-lg border-2 transition-all',
                        settings.accentColor === color.value
                          ? 'border-morandi-900 scale-110'
                          : 'border-morandi-300 hover:scale-105'
                      ]"
                      :style="{ backgroundColor: color.color }"
                      :title="color.label"
                    />
                  </div>
                </div>

                <!-- 窗口透明度 -->
                <div>
                  <div class="mb-3">
                    <h4 class="font-medium text-morandi-900">窗口透明度</h4>
                    <p class="text-sm text-morandi-600">调整应用主窗口的透明度</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <input
                      type="range"
                      min="70"
                      max="100"
                      v-model="settings.windowOpacity"
                      class="flex-1 h-2 bg-morandi-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span class="text-sm text-morandi-600 min-w-[3rem]">
                      {{ settings.windowOpacity }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 账户与云盘 -->
            <div v-else-if="currentCategory === 'account'">
              <h3 class="text-xl font-bold text-morandi-900 mb-6">账户与云盘</h3>
              
              <div class="space-y-8">
                <!-- 账户信息 -->
                <div>
                  <h4 class="font-medium text-morandi-900 mb-4">账户信息</h4>
                  <div class="bg-morandi-50 rounded-lg p-4">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                        <User :size="32" class="text-white" />
                      </div>
                      <div>
                        <h5 class="font-medium text-morandi-900">admin</h5>
                        <p class="text-sm text-morandi-600">管理员账户</p>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <button
                        @click="showChangePasswordDialog = true"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        修改密码
                      </button>
                      <button
                        @click="handleLogout"
                        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        注销登录
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 云盘存储 -->
                <div>
                  <h4 class="font-medium text-morandi-900 mb-4">云盘存储</h4>
                  <div class="bg-morandi-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm text-morandi-600">已用空间</span>
                      <span class="text-sm font-medium text-morandi-900">
                        {{ storageUsed }} / {{ storageTotal }}
                      </span>
                    </div>
                    
                    <!-- 存储进度条 -->
                    <div class="w-full bg-morandi-200 rounded-full h-3 mb-4">
                      <div
                        class="bg-teal-500 h-3 rounded-full transition-all duration-300"
                        :style="{ width: storagePercentage + '%' }"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-morandi-600">
                      <span>{{ storagePercentage }}% 已使用</span>
                      <button
                        @click="$router.push('/drive')"
                        class="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        管理存储空间
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关于 -->
            <div v-else-if="currentCategory === 'about'">
              <h3 class="text-xl font-bold text-morandi-900 mb-6">关于</h3>
              
              <div class="space-y-6">
                <!-- 应用版本 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">应用版本</h4>
                    <p class="text-sm text-morandi-600">Liteisle Desktop v1.0.0</p>
                  </div>
                  <button
                    @click="handleCheckUpdates"
                    :disabled="isCheckingUpdates"
                    class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                  >
                    {{ isCheckingUpdates ? '检查中...' : '检查更新' }}
                  </button>
                </div>

                <!-- 帮助与反馈 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">帮助与反馈</h4>
                    <p class="text-sm text-morandi-600">获取帮助或提供反馈建议</p>
                  </div>
                  <div class="flex gap-3">
                    <button
                      class="px-4 py-2 border border-morandi-300 text-morandi-700 rounded-lg hover:bg-morandi-50 transition-colors"
                    >
                      帮助文档
                    </button>
                    <button
                      class="px-4 py-2 border border-morandi-300 text-morandi-700 rounded-lg hover:bg-morandi-50 transition-colors"
                    >
                      反馈建议
                    </button>
                  </div>
                </div>

                <!-- 开发者信息 -->
                <div class="bg-morandi-50 rounded-lg p-4">
                  <h4 class="font-medium text-morandi-900 mb-3">开发者信息</h4>
                  <div class="text-sm text-morandi-600 space-y-2">
                    <p>Liteisle Desktop 是一个专注于学习和效率的桌面应用程序。</p>
                    <p>感谢所有为此项目做出贡献的开发者和用户。</p>
                    <div class="mt-4 pt-4 border-t border-morandi-200">
                      <p class="font-medium text-morandi-700">技术栈</p>
                      <p>Vue 3 + TypeScript + Electron + Tailwind CSS</p>
                    </div>
                  </div>
                </div>

                <!-- 重置设置 -->
                <div class="border-t border-morandi-200 pt-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-red-600">重置所有设置</h4>
                      <p class="text-sm text-morandi-600">将所有设置恢复为默认值</p>
                    </div>
                    <button
                      @click="showResetDialog = true"
                      class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      重置设置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <div v-if="showChangePasswordDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">修改密码</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">原密码</label>
            <input
              v-model="oldPassword"
              type="password"
              placeholder="请输入原密码"
              class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">新密码</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="请输入新密码"
              class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">确认新密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showChangePasswordDialog = false"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="handleChangePassword"
            :disabled="isChangingPassword"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {{ isChangingPassword ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 重置设置确认对话框 -->
    <div v-if="showResetDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">重置所有设置</h3>
        <p class="text-morandi-600 mb-6">此操作将清除所有个人设置并恢复为默认值，是否继续？</p>
        <div class="flex justify-end gap-3">
          <button
            @click="showResetDialog = false"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="handleResetSettings"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            确认重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, HardDrive, User, FileText, Home } from 'lucide-vue-next'

const router = useRouter()

// 响应式状态
const currentCategory = ref('general')
const showChangePasswordDialog = ref(false)
const showResetDialog = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)
const isCheckingUpdates = ref(false)

// 设置数据
const settings = ref({
  launchAtStartup: false,
  language: 'zh-CN',
  defaultPage: 'home',
  focusTime: 25,
  breakTime: 5,
  soundEnabled: true,
  soundType: 'bell',
  autoNextRound: false,
  themeMode: 'light',
  accentColor: '#14B8A6',
  windowOpacity: 100
})

// 设置分类
const categories = [
  { id: 'general', name: '通用', description: '基础应用设置' },
  { id: 'focus', name: '专注', description: '番茄钟设置' },
  { id: 'appearance', name: '外观', description: '主题和界面' },
  { id: 'account', name: '账户与云盘', description: '用户和存储' },
  { id: 'about', name: '关于', description: '版本和帮助' }
]

// 图标映射
const iconMap = {
  general: Settings,
  focus: HardDrive,
  appearance: FileText,
  account: User,
  about: Home
}

// 主题选项
const themes = [
  { value: 'light', label: '浅色模式' },
  { value: 'dark', label: '深色模式' },
  { value: 'system', label: '跟随系统' }
]

// 主色调选项
const accentColors = [
  { value: '#14B8A6', label: 'Teal', color: '#14B8A6' },
  { value: '#3B82F6', label: 'Blue', color: '#3B82F6' },
  { value: '#10B981', label: 'Green', color: '#10B981' },
  { value: '#F59E0B', label: 'Amber', color: '#F59E0B' },
  { value: '#EF4444', label: 'Red', color: '#EF4444' },
  { value: '#8B5CF6', label: 'Purple', color: '#8B5CF6' }
]

// 计算属性
const storageUsed = computed(() => '2.5 GB')
const storageTotal = computed(() => '10 GB')
const storagePercentage = computed(() => 25)

// 事件处理
const handleLogout = () => {
  if (confirm('确定要注销登录吗？')) {
    localStorage.removeItem('liteisle-user')
    router.push('/login')
  }
}

const handleChangePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('请填写完整信息')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('两次输入的新密码不一致')
    return
  }

  isChangingPassword.value = true
  
  try {
    // 模拟密码修改
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('密码修改成功')
    showChangePasswordDialog.value = false
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    alert('密码修改失败')
  }
  
  isChangingPassword.value = false
}

const handleCheckUpdates = async () => {
  isCheckingUpdates.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('应用已是最新版本')
  } catch (error) {
    alert('检查更新失败')
  }
  
  isCheckingUpdates.value = false
}

const handleResetSettings = () => {
  settings.value = {
    launchAtStartup: false,
    language: 'zh-CN',
    defaultPage: 'home',
    focusTime: 25,
    breakTime: 5,
    soundEnabled: true,
    soundType: 'bell',
    autoNextRound: false,
    themeMode: 'light',
    accentColor: '#14B8A6',
    windowOpacity: 100
  }
  showResetDialog.value = false
  alert('设置已重置为默认值')
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 自定义滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #14B8A6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #14B8A6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* 复选框样式优化 */
input[type="checkbox"]:checked {
  background-color: #14B8A6;
  border-color: #14B8A6;
}

input[type="checkbox"]:focus {
  ring-color: #14B8A6;
}
</style> 