<template>
  <div class="flex flex-col h-full p-6 pb-24 select-none">
    <div class="flex flex-1 gap-6 min-h-0">
      <!-- 第一栏：设置分类导航 -->
      <div class="card w-64 flex-shrink-0">
        <div class="h-full flex flex-col p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-morandi-900">系统设置</h2>
          </div>
          <nav class="space-y-2 flex-1 overflow-y-auto">
            <button
              v-for="category in settingsStore.categories"
              :key="category.id"
              @click="settingsStore.setCurrentCategoryId(category.id)"
              :class="[
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200',
                settingsStore.currentCategoryId === category.id
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : 'text-morandi-700 hover:bg-morandi-100 border border-transparent'
              ]"
            >
              <component :is="category.icon" :size="20" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ category.name }}</div>
                <div class="text-xs text-morandi-500 truncate">{{ category.description }}</div>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- 第二栏：设置项 -->
      <div class="card flex-1 min-w-0">
        <div class="h-full p-6 overflow-y-auto">
          <!-- 通用设置 -->
          <div v-if="settingsStore.currentCategoryId === 'general'">
            <h3 class="text-xl font-bold text-morandi-900 mb-6">通用设置</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-morandi-900">开机自启</h4>
                  <p class="text-sm text-morandi-600">应用在电脑开机时自动运行</p>
                </div>
                <input 
                  type="checkbox" 
                  v-model="settingsStore.settings.launchAtStartup" 
                  class="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" 
                />
              </div>
            </div>
          </div>

          <!-- 账户与云盘设置 -->
          <div v-else-if="settingsStore.currentCategoryId === 'account'" class="h-full flex flex-col items-center justify-center text-center">
            <!-- 用户头像 -->
            <div class="w-20 h-20 mb-4 bg-teal-100 rounded-full flex items-center justify-center">
              <User :size="40" class="text-teal-600" />
            </div>
            
            <!-- 用户名 -->
            <h3 class="text-xl font-bold text-morandi-900 mb-2">{{ settingsStore.settings.username }}</h3>
            <p class="text-sm text-morandi-600 mb-6">用户账户</p>
            
            <!-- 云盘容量信息 -->
            <div class="mb-6 w-full max-w-sm">
              <div class="flex items-center justify-center gap-2 mb-3">
                <HardDrive :size="20" class="text-morandi-600" />
                <h4 class="font-medium text-morandi-900">云盘容量</h4>
              </div>
              
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-morandi-600">{{ settingsStore.storageInfo.text }}</span>
                  <span class="font-medium text-morandi-900">{{ settingsStore.storageInfo.percentage.toFixed(1) }}%</span>
                </div>
                
                <!-- 进度条 -->
                <div class="w-full bg-morandi-200 rounded-full h-2.5">
                  <div 
                    class="bg-gradient-to-r from-teal-400 to-teal-600 h-2.5 rounded-full transition-all duration-300"
                    :style="{ width: settingsStore.storageInfo.percentage + '%' }"
                  ></div>
                </div>
                
                <div class="flex justify-between text-xs text-morandi-500">
                  <span>0 GB</span>
                  <span>{{ settingsStore.cloudStorage.total }} GB</span>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex gap-3">
              <button 
                @click="showChangePasswordDialog = true"
                class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
              >
                修改密码
              </button>
              <button 
                @click="handleLogout"
                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                退出登录
              </button>
            </div>
          </div>

          <!-- 关于 -->
          <div v-else-if="settingsStore.currentCategoryId === 'about'" class="h-full flex flex-col items-center justify-center text-center">
            <!-- 应用图标 -->
            <div class="w-20 h-20 mb-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center">
              <FileText :size="40" class="text-white" />
            </div>
            
            <!-- 应用名称 -->
            <h3 class="text-2xl font-bold text-morandi-900 mb-2">轻屿记</h3>
            <p class="text-lg text-morandi-600 mb-4">LiteIsle</p>
            
            <!-- 版本号 -->
            <div class="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium mb-6">
              版本 1.0.0
            </div>
            
            <!-- 应用描述 -->
            <div class="mb-8">
              <p class="text-sm text-morandi-600 mb-2">一个轻量级的桌面应用</p>
              <p class="text-xs text-morandi-500">专注于简洁高效的用户体验</p>
            </div>
            
            <!-- 检查更新按钮 -->
            <button 
              @click="checkForUpdates"
              :disabled="isCheckingUpdates"
              class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm"
            >
              {{ isCheckingUpdates ? '检查中...' : '检查更新' }}
            </button>
          </div>
          
          <!-- 其他分类的占位符 -->
          <div v-else-if="settingsStore.currentCategory">
            <h3 class="text-xl font-bold text-morandi-900 mb-6">{{ settingsStore.currentCategory.name }}</h3>
            <p>此处的设置项待实现。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div 
      v-if="showChangePasswordDialog" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showChangePasswordDialog = false"
    >
      <div class="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <h3 class="text-lg font-bold text-morandi-900 mb-4">修改密码</h3>
        <form @submit.prevent="submitPasswordChange">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-1">当前密码</label>
              <input 
                type="password" 
                v-model="passwordForm.currentPassword"
                class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-1">新密码</label>
              <input 
                type="password" 
                v-model="passwordForm.newPassword"
                class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-1">确认新密码</label>
              <input 
                type="password" 
                v-model="passwordForm.confirmPassword"
                class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text"
                required
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              @click="showChangePasswordDialog = false"
              class="px-4 py-2 text-morandi-700 border border-morandi-300 rounded-lg hover:bg-morandi-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              :disabled="isChangingPassword"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {{ isChangingPassword ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/SettingsStore';
import { ref } from 'vue';
import { User, HardDrive, FileText } from 'lucide-vue-next';

const settingsStore = useSettingsStore();

// 修改密码对话框状态
const showChangePasswordDialog = ref(false);

// 修改密码表单数据
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 修改密码状态
const isChangingPassword = ref(false);

// 检查更新状态
const isCheckingUpdates = ref(false);

// 退出登录处理 - 与顶部栏注销功能一样
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    // 清空本地存储
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // 跳转到登录页
    window.location.href = '#/login';
  }
};

// 提交密码修改
const submitPasswordChange = async () => {
  // 验证密码
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('新密码与确认密码不一致');
    return;
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    alert('新密码长度至少6位');
    return;
  }

  isChangingPassword.value = true;
  
  try {
    // 调用store的修改密码方法
    await settingsStore.changePassword(
      passwordForm.value.currentPassword, 
      passwordForm.value.newPassword
    );
    
    alert('密码修改成功');
    showChangePasswordDialog.value = false;
    
    // 清空表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    alert(error || '密码修改失败');
  } finally {
    isChangingPassword.value = false;
  }
};

// 检查更新
const checkForUpdates = async () => {
  isCheckingUpdates.value = true;
  
  try {
    const result = await settingsStore.checkForUpdates();
    alert(result);
  } catch (error) {
    alert('检查更新失败');
  } finally {
    isCheckingUpdates.value = false;
  }
};
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