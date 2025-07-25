<template>
  <div class="min-h-full bg-liteisle-bg p-6 select-none">
    <div class="max-w-7xl mx-auto">
      <div class="h-[calc(100vh-10rem)] flex gap-6">
        <!-- 第一栏：传输分类导航 -->
        <div class="card w-64 flex-shrink-0">
          <div class="h-full flex flex-col p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-morandi-900">传输管理</h2>
            </div>
            <nav class="space-y-2 flex-1 overflow-y-auto">
              <button
                v-for="cat in categories"
                :key="cat.type"
                @click="activeCategory = cat.type"
                :class="[
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200',
                  activeCategory === cat.type
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'text-morandi-700 hover:bg-morandi-100 border border-transparent'
                ]"
              >
                <component :is="cat.icon" :size="20" class="flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ cat.label }}</div>
                  <div class="text-xs text-morandi-500 truncate">
                    {{ getTaskCount(cat.type) }} 个任务
                  </div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        <!-- 第二栏：传输列表 -->
        <div class="card flex-1 min-w-0">
          <div 
            class="h-full p-6 overflow-y-auto"
            @drop.prevent="handleFileDrop"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            :class="{ 'bg-teal-50/50': isDragging }"
          >
            <!-- 顶部操作栏 -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <button @click="triggerFileUpload" class="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm">
                  <Upload :size="16" />
                  <span>上传文件</span>
                </button>
                <button @click="showLinkDialog = true" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  <Link :size="16" />
                  <span>分享链接下载</span>
                </button>
              </div>
              <button
                @click="showClearConfirm = true"
                :class="[activeStatus === 'completed' ? 'visible' : 'invisible']"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!hasCompletedTasks"
              >
                <Trash2 :size="14" />
                <span>清空全部记录</span>
              </button>
            </div>

            <!-- 状态切换 -->
            <div class="flex items-center gap-6 border-b border-gray-200 mb-6">
              <button
                v-for="stat in statuses"
                :key="stat.type"
                @click="activeStatus = stat.type"
                class="pb-2 text-sm font-semibold transition-colors"
                :class="activeStatus === stat.type ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'"
              >
                {{ stat.label }} {{ getStatusCount(stat.type) }}
              </button>
            </div>

            <!-- 任务列表 -->
            <div class="flex-1 h-[calc(100%-8rem)] relative">
              <div 
                v-if="filteredTasks.length === 0" 
                class="absolute inset-0 flex items-center justify-center text-center text-gray-500"
              >
                <div>
                  <FolderOpen :size="64" class="mx-auto mb-4 text-gray-300" />
                  <p>点击<button @click="triggerFileUpload" class="text-teal-600 font-semibold mx-1">上传文件</button>或拖拽/粘贴到此处上传</p>
                </div>
              </div>

              <div v-else class="space-y-3">
                <div 
                  v-for="task in filteredTasks" 
                  :key="task.id" 
                  class="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-morandi-200/50 hover:bg-white/90 hover:border-morandi-300 transition-all duration-200"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <component :is="task.icon" :size="28" class="text-gray-600" />
                      <div class="flex-1">
                        <p class="font-medium text-gray-800">{{ task.name }}</p>
                        <div class="text-sm text-gray-500 flex items-center gap-4 mt-1">
                          <span>{{ task.size }}</span>
                          <div v-if="activeStatus === 'progressing'" class="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-teal-500" :style="{ width: task.progress + '%' }"></div>
                          </div>
                          <span v-if="activeStatus === 'progressing'">{{ task.speed }}</span>
                          <span :class="task.status === 'completed' ? 'text-green-600' : 'text-blue-600'">{{ getStatusText(task.status) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button v-if="task.status === 'progressing'" @click="cancelTask(task.id)" class="text-gray-400 hover:text-red-500 transition-colors" title="取消任务">
                        <X :size="18" />
                      </button>
                      <button v-if="task.status === 'completed'" @click="showDeleteConfirmDialog(task)" class="text-gray-400 hover:text-red-500 transition-colors" title="删除记录">
                        <Trash2 :size="18" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传input -->
    <input type="file" ref="fileInput" @change="handleFileSelect" multiple class="hidden" />

    <!-- 分享链接下载对话框 -->
    <div v-if="showLinkDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">分享链接下载</h3>
        <div class="relative">
          <input
            v-model="linkUrl"
            type="text"
            placeholder="请输入分享链接"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-20 select-text"
            style="user-select: text !important;"
          />
          <button @click="pasteFromClipboard" class="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
            粘贴
          </button>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showLinkDialog = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="startLinkDownload"
            :disabled="!linkUrl.trim()"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            下载
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 class="text-lg font-bold mb-2">确认删除</h3>
        <p class="text-sm text-gray-600 mb-6">您要如何处理这条记录？</p>
        <div class="flex flex-col gap-3">
          <button
            @click="handleDeleteTask(true)"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            同时删除文件和记录
          </button>
          <button
            @click="handleDeleteTask(false)"
            class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            仅删除记录
          </button>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="showDeleteConfirm = false; taskToDelete = null"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div v-if="showClearConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 class="text-lg font-bold mb-2">清空已完成记录</h3>
        <p class="text-sm text-gray-600 mb-6">您要如何处理这些记录？此操作不可逆。</p>
        <div class="flex flex-col gap-3">
          <button @click="handleClearCompleted(true)" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            同时删除文件和记录
          </button>
          <button @click="handleClearCompleted(false)" class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            仅删除记录
          </button>
        </div>
        <div class="flex justify-end mt-6">
          <button @click="showClearConfirm = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Upload, Download, Link, Trash2, FolderOpen, X } from 'lucide-vue-next';
import { useToast } from 'vue-toastification'
import { useDriveStore } from '@/store/DriveStore';
import { useTransferStore } from '@/store/TransferStore';
import { useShareStore } from '@/store/ShareStore';

const toast = useToast()

type CategoryType = 'upload' | 'download';
type StatusType = 'progressing' | 'completed';

interface Task {
  id: number;
  name: string;
  category: CategoryType;
  status: StatusType;
  size: string;
  speed: string;
  progress: number;
  icon: any;
  intervalId?: number;
}

const activeCategory = ref<CategoryType>('upload');
const activeStatus = ref<StatusType>('progressing');
const showLinkDialog = ref(false);
const showDeleteConfirm = ref(false);
const showClearConfirm = ref(false);
const taskToDelete = ref<Task | null>(null);
const linkUrl = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const driveStore = useDriveStore();
const transferStore = useTransferStore();
const shareStore = useShareStore();

const categories: { type: CategoryType; label: string; icon: any; }[] = [
  { type: 'upload', label: '上传', icon: Upload },
  { type: 'download', label: '下载', icon: Download },
];

const statuses: { type: StatusType; label: string; }[] = [
  { type: 'progressing', label: '进行中' },
  { type: 'completed', label: '已完成' },
];

// 移除未使用的模拟数据
// const allTasks = ref<Task[]>([]);
// let taskIdCounter = 0;

const getTaskCount = (category: CategoryType) => {
  const allTasks = [...transferStore.processingTasks, ...transferStore.completedTasks];
  return allTasks.filter((task: any) => task.transfer_type === category || task.transfer_type === category.toUpperCase()).length;
};

const getStatusCount = (status: StatusType) => {
  const allTasks = [...transferStore.processingTasks, ...transferStore.completedTasks];
  return allTasks.filter((task: any) => 
    task.transfer_type === activeCategory.value && 
    (status === 'progressing' ? 
      transferStore.processingTasks.includes(task) : 
      transferStore.completedTasks.includes(task)
    )
  ).length;
};

const hasCompletedTasks = computed(() => {
  return transferStore.completedTasks.length > 0;
});

const filteredTasks = computed(() => {
  let storeTasks: any[] = [];

  if (activeStatus.value === 'progressing') {
    storeTasks = transferStore.processingTasks;
  } else {
    storeTasks = transferStore.completedTasks;
  }

  const mappedTasks = storeTasks.map((task: any) => ({
    id: task.log_id || Math.random(),
    name: task.item_name || '未知文件',
    category: task.transfer_type as CategoryType,
    status: activeStatus.value as StatusType,
    size: transferStore.formatFileSize(task.item_size || 0),
    speed: task.speed || '0 KB/s',
    progress: task.progress || 0,
    icon: task.transfer_type === 'upload' ? Upload : Download
  }))

  return mappedTasks.filter((t: any) =>
    t.category === activeCategory.value
  )
});

// formatBytes 函数已在 TransferStore 中提供，这里不需要重复定义

// 移除未使用的模拟函数，现在使用真实的TransferStore

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    // 使用 TransferStore 处理上传到"上传"文件夹
    await transferStore.uploadFiles(files, '/上传');
    activeCategory.value = 'upload';
    activeStatus.value = 'progressing';
  }
};

const handleClearCompleted = async (deleteFiles: boolean) => {
    try {
        const success = await transferStore.clearCompletedTasks(deleteFiles);
        if (success) {
            if (deleteFiles) {
                toast.success(`已清空所有已完成记录并删除关联文件`);
            } else {
                toast.success(`已清空所有已完成记录`);
            }
        }
    } catch (error) {
        console.error('清空已完成记录失败:', error);
        toast.error('清空已完成记录失败');
    }
    showClearConfirm.value = false;
};

const cancelTask = async (id: number) => {
    try {
        // 根据任务类型调用不同的取消方法
        const task = [...transferStore.processingTasks, ...transferStore.completedTasks].find(t => t.log_id === id);
        if (task) {
            if (task.transfer_type === 'upload') {
                await transferStore.cancelUpload(id);
            } else {
                await transferStore.cancelDownload(id);
            }
            // toast 消息已在 store 中处理，这里不需要重复显示
        } else {
            toast.error('任务不存在');
        }
    } catch (error) {
        console.error('取消任务失败:', error);
        toast.error('取消任务失败');
    }
};

const showDeleteConfirmDialog = (task: Task) => {
    taskToDelete.value = task;
    showDeleteConfirm.value = true;
};

const handleDeleteTask = async (deleteFile: boolean) => {
    if (!taskToDelete.value) return;

    try {
        const success = await transferStore.deleteTransferRecord(taskToDelete.value.id, deleteFile);
        if (success) {
            // toast 消息已在 store 中处理，这里不需要重复显示
        }
    } catch (error) {
        console.error('删除传输记录失败:', error);
        toast.error('删除传输记录失败');
    }

    showDeleteConfirm.value = false;
    taskToDelete.value = null;
};

const pasteFromClipboard = async () => {
  try {
    linkUrl.value = await navigator.clipboard.readText();
  } catch (err) {
    alert('无法读取剪贴板，请检查浏览器权限设置。');
  }
};

const startLinkDownload = async () => {
  if (!linkUrl.value.trim()) {
    toast.error('请输入分享链接');
    return;
  }

  try {
    // 解析分享链接
    const shareInfo = shareStore.parseShareLink(linkUrl.value.trim());
    if (!shareInfo) {
      toast.error('分享链接格式不正确');
      return;
    }

    // 验证分享链接
    const verifyResult = await shareStore.verifyShare({
      share_token: shareInfo.token,
      share_password: shareInfo.password
    });

    if (!verifyResult) {
      return; // 错误信息已在store中显示
    }

    // 显示确认对话框，让用户选择保存位置
    // 使用当前文件夹作为保存位置，如果在根目录则保存到根目录
    const targetFolderId = driveStore.currentFolderId || 0;
    const saveResult = await shareStore.saveShare({
      share_token: shareInfo.token,
      share_password: shareInfo.password,
      target_folder_id: targetFolderId
    });

    if (saveResult) {
      // 切换到下载标签页
      activeCategory.value = 'download';
      activeStatus.value = 'progressing';

      // 刷新传输记录
      await transferStore.loadTransferHistory('processing', true);
    }

    showLinkDialog.value = false;
    linkUrl.value = '';
  } catch (error) {
    console.error('处理分享链接失败:', error);
    toast.error('处理分享链接失败');
  }
};

const getStatusText = (status: StatusType) => status === 'progressing' ? '进行中' : '已完成';

const isDragging = ref(false);

const handleDragOver = (event: DragEvent) => {
  isDragging.value = true;
  event.dataTransfer!.dropEffect = 'copy';
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleFileDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  if (files.length > 0) {
    await transferStore.uploadFiles(files, '/上传');
    activeCategory.value = 'upload';
    activeStatus.value = 'progressing';
  }
};

const handlePaste = async (event: ClipboardEvent) => {
  const items = Array.from(event.clipboardData?.items || []);
  const files = items
    .filter(item => item.kind === 'file')
    .map(item => item.getAsFile())
    .filter((file): file is File => file !== null);
    
  if (files.length > 0) {
    await transferStore.uploadFiles(files, '/上传');
    activeCategory.value = 'upload';
    activeStatus.value = 'progressing';
  }
};

onMounted(async () => {
  document.addEventListener('paste', handlePaste);

  // 加载传输记录
  console.log('传输页面加载，开始获取传输记录');
  await transferStore.loadTransferSummary();
  await transferStore.loadTransferHistory('processing', true);
  await transferStore.loadTransferHistory('success', true);
});

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste);
});
</script>

<style scoped>
.card {
  transition: background-color 0.3s ease;
}
</style> 