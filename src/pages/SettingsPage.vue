<template>
  <div class="min-h-full bg-liteisle-bg p-6 select-none">
    <div class="max-w-7xl mx-auto">
      <div class="h-[calc(100vh-12rem)] flex gap-6">
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
                
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-morandi-900">下载目录</h4>
                    <p class="text-sm text-morandi-600">文件下载的默认保存位置</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <input 
                      type="text" 
                      v-model="settingsStore.settings.downloadDirectory" 
                      class="px-3 py-1 text-sm border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text w-64"
                      placeholder="选择下载目录"
                      style="user-select: text !important;"
                    />
                    <button 
                      @click="selectDownloadDirectory"
                      class="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      浏览
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 账户与云盘设置 -->
            <div v-else-if="settingsStore.currentCategoryId === 'account'" class="h-full flex flex-col items-center justify-center text-center">
              <!-- 用户头像 -->
              <div class="w-20 h-20 mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                <User :size="40" class="text-teal-600" />
              </div>
              
              <!-- 用户名和邮箱 -->
              <h3 class="text-xl font-bold text-morandi-900 mb-2">{{ settingsStore.settings.username }}</h3>
              <p class="text-sm text-morandi-500 mb-6">{{ authStore.user?.email || 'admin@example.com' }}</p>
              
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
              
              <!-- 登录会话信息 -->
              <div class="mb-6 w-full max-w-sm">
                <div class="flex items-center justify-center gap-2 mb-3">
                  <Clock :size="20" class="text-morandi-600" />
                  <h4 class="font-medium text-morandi-900">登录会话</h4>
                </div>
                
                <div class="space-y-3">
                  <!-- Token 信息 -->
                  <div class="bg-teal-50 rounded-lg p-3">
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-teal-700">会话剩余时间</span>
                      <span class="font-medium text-teal-900">{{ authStore.tokenRemainingText }}</span>
                    </div>
                    <div class="text-xs text-teal-600">
                      桌面端应用 (30天有效期)
                    </div>
                  </div>
                  
                  <!-- 会话说明 -->
                  <div class="text-xs text-morandi-500 text-center bg-morandi-100 rounded-lg p-2">
                    <div class="font-medium mb-1">🔐 会话管理</div>
                    <div>桌面端应用自动保持30天登录状态</div>
                    <div>会话过期后需要重新登录</div>
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

            <!-- 我的分享 -->
            <div v-else-if="settingsStore.currentCategoryId === 'shares'" class="h-full flex flex-col">
              <h3 class="text-xl font-bold text-morandi-900 mb-6 flex-shrink-0">我的分享</h3>
              
              <!-- 分享列表 -->
              <div class="space-y-4 flex-1">
                <!-- 列表容器 -->
                <div 
                  class="bg-transparent rounded-lg h-full overflow-y-auto"
                >
                  <div v-if="settingsStore.shareItems.length === 0" class="p-8 text-center text-morandi-500">
                    暂无分享记录
                  </div>
                  <div v-else class="space-y-3">
                    <div 
                      v-for="share in settingsStore.shareItems" 
                      :key="share.id"
                      class="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-morandi-200/50 hover:bg-white/90 hover:border-morandi-300 transition-all duration-200"
                    >
                      <div class="flex flex-col">
                        <!-- 第一行：文件名、标签和操作按钮 -->
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-3">
                            <div class="text-sm font-medium text-morandi-900">
                              {{ share.name }}
                            </div>
                            <div class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {{ share.type === 'folder' ? '文件夹' : '文件' }}
                            </div>
                            <div 
                              :class="[
                                'px-2 py-1 text-xs rounded-full',
                                share.status === 'active' ? 'bg-green-100 text-green-800' : 
                                share.status === 'expired' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              ]"
                            >
                              {{ share.status === 'active' ? '永久有效' : 
                                  share.status === 'expired' ? '已过期' : '已禁用' }}
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <button 
                              @click="copyShareInfo(share)"
                              class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              一键复制
                            </button>
                            <button 
                              @click="cancelShare(share.id)"
                              class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              取消分享
                            </button>
                          </div>
                        </div>
                        
                        <!-- 第二行：分享信息 -->
                        <div class="text-sm text-morandi-600 space-y-1">
                          <div>分享链接: {{ settingsStore.generateShareLink(share.shareToken) }}</div>
                          <div>访问密码: {{ share.sharePassword }}</div>
                          <div>有效期: {{ share.expiryDate }}</div>
                          <div>分享时间: {{ share.createdAt }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 专注记录 -->
            <div v-else-if="settingsStore.currentCategoryId === 'focus'" class="h-full flex flex-col">
              <h3 class="text-xl font-bold text-morandi-900 mb-6 flex-shrink-0">专注记录</h3>
              
              <!-- 原始专注记录 -->
              <div class="space-y-4 flex-1">
                <!-- 记录列表 -->
                <div 
                  class="bg-transparent rounded-lg h-full overflow-y-auto"
                  @scroll="handleScroll"
                >
                  <div v-if="focusRecords.length === 0" class="p-8 text-center text-morandi-500">
                    暂无专注记录
                  </div>
                  <div v-else class="space-y-3">
                    <div 
                      v-for="record in focusRecords" 
                      :key="record.date"
                      class="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-morandi-200/50 hover:bg-white/90 hover:border-morandi-300 transition-all duration-200"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <div class="text-sm font-medium text-morandi-900">
                              {{ formatDate(record.date) }}
                            </div>
                            <div class="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                              专注
                            </div>
                          </div>
                          <div class="text-sm text-morandi-600 space-y-1">
                            <div>专注时长: {{ formatMinutes(record.focusMinutes) }}</div>
                            <div>专注次数: {{ record.focusSessions }} 次</div>
                            <div v-if="record.longestSession">最长单次: {{ formatMinutes(record.longestSession) }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-lg font-bold text-morandi-900">
                            {{ formatMinutes(record.focusMinutes) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 加载更多指示器 -->
                  <div v-if="isLoadingRecords" class="flex justify-center py-4">
                    <div class="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关于 -->
            <div v-else-if="settingsStore.currentCategoryId === 'about'" class="h-full flex flex-col items-center justify-center text-center">
              <div class="w-20 h-20 mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                <FileText :size="40" class="text-teal-600" />
              </div>
              
              <h3 class="text-xl font-bold text-morandi-900 mb-2">轻屿记 LiteIsle</h3>
              <p class="text-sm text-morandi-500 mb-6">版本 {{ settingsStore.settings.version }}</p>
              
              <div class="space-y-3">
                <button 
                  @click="checkForUpdates"
                  :disabled="isCheckingUpdates"
                  class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50"
                >
                  {{ isCheckingUpdates ? '检查中...' : '检查更新' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 修改密码对话框 -->
  <div 
    v-if="showChangePasswordDialog" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="showChangePasswordDialog = false"
  >
    <div 
      class="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
      @click.stop
    >
      <h3 class="text-lg font-bold text-morandi-900 mb-4">修改密码</h3>
      <form @submit.prevent="submitPasswordChange">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-1">当前密码</label>
            <input
              type="password"
              v-model="passwordForm.currentPassword"
              required
              class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text"
              style="user-select: text !important;"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-1">新密码</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text"
              style="user-select: text !important;"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-1">确认新密码</label>
            <input
              type="password"
              v-model="passwordForm.confirmPassword"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 select-text"
              style="user-select: text !important;"
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
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/SettingsStore';
import { useFocusStore } from '@/store/FocusStore';
import { useAuthStore } from '@/store/AuthStore';
import { ref, computed, onMounted } from 'vue';
import { User, HardDrive, FileText, Clock } from 'lucide-vue-next';

const settingsStore = useSettingsStore();
const focusStore = useFocusStore();
const authStore = useAuthStore();

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

// 专注记录相关状态
const focusRecords = ref<Array<{
  date: string;
  focusMinutes: number;
  focusSessions: number;
  longestSession: number;
  hasCheckin: boolean;
}>>([]);

const isLoadingRecords = ref(false);
const hasMoreRecords = ref(true);

// 专注统计
const focusStats = computed(() => ({
  totalMinutes: focusStore.totalFocusTime / (1000 * 60), // 转换为分钟
  totalDays: focusStore.totalFocusCount,
  streakDays: focusStore.getCheckInStats.consecutiveCheckins
}));

// 格式化方法
const formatTotalTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  
  if (hours >= 1) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

const formatMinutes = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  }
};

const formatSessionDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  }
};

const formatSessionTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// 加载专注记录
const loadFocusRecords = () => {
  // 从 focusStore 获取最近的专注数据
  const records: Array<{
    date: string;
    focusMinutes: number;
    focusSessions: number;
    longestSession: number;
    hasCheckin: boolean;
  }> = [];
  
  // 获取最近30天的数据
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dailyMinutes = focusStore.dailyFocusData.get(dateStr) || 0;
    
    if (dailyMinutes > 0) {
      records.push({
        date: dateStr,
        focusMinutes: dailyMinutes,
        focusSessions: Math.ceil(dailyMinutes / 25), // 假设每次25分钟
        longestSession: Math.min(dailyMinutes, 90), // 假设最长90分钟
        hasCheckin: dailyMinutes >= 30
      });
    }
  }
  
  focusRecords.value = records;
};

const loadMoreRecords = () => {
  if (isLoadingRecords.value || !hasMoreRecords.value) return;
  
  // 模拟加载更多
  isLoadingRecords.value = true;
  setTimeout(() => {
    // 这里可以加载更多数据到 focusRecords.value
    // 现在先模拟没有更多数据
    isLoadingRecords.value = false;
    hasMoreRecords.value = false;
  }, 1000);
};

// 滚动加载处理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  
  // 当滚动到接近底部时触发加载更多（距离底部50px）
  if (scrollTop + clientHeight >= scrollHeight - 50 && hasMoreRecords.value && !isLoadingRecords.value) {
    loadMoreRecords();
  }
};

// 选择下载目录
const selectDownloadDirectory = async () => {
  try {
    // 检查是否在 Electron 环境中
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.selectDirectory();
      
      if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        settingsStore.updateSetting('downloadDirectory', selectedPath);
        settingsStore.saveSettings();
        alert('下载目录已更新: ' + selectedPath);
        return;
      } else if (result && result.canceled) {
        return; // 用户取消选择
      }
    }
    
    // 在浏览器环境中或选择失败时，使用手动输入
    const newPath = prompt('请输入下载目录路径:', settingsStore.settings.downloadDirectory);
    if (newPath && newPath.trim()) {
      settingsStore.updateSetting('downloadDirectory', newPath.trim());
      settingsStore.saveSettings();
      alert('下载目录已更新');
    }
  } catch (error) {
    alert(`选择目录失败: ${error instanceof Error ? error.message : '未知错误'}`);
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

// 取消分享
const cancelShare = (shareId: number) => {
  if (confirm('确定要取消这个分享吗？')) {
    const success = settingsStore.cancelShare(shareId);
    if (success) {
      alert('分享已取消');
    } else {
      alert('取消分享失败');
    }
  }
};

// 一键复制分享信息
const copyShareInfo = async (share: any) => {
  const success = await settingsStore.copyShareInfo(share.shareToken, share.sharePassword);
  if (success) {
    alert('分享信息已复制到剪贴板');
  } else {
    alert('复制失败');
  }
};

// 初始化专注记录
onMounted(() => {
  loadFocusRecords();
});
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