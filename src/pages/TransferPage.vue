<template>
  <div class="min-h-full bg-liteisle-bg p-6 select-none">
    <div class="max-w-7xl mx-auto">
      <div class="h-[calc(100vh-12rem)] card p-0 flex">
        <!-- 左侧导航 -->
        <div class="w-56 border-r border-gray-200 p-4">
          <h2 class="text-lg font-bold text-gray-800 px-2 mb-4">传输</h2>
          <div class="space-y-2">
            <button
              v-for="cat in categories"
              :key="cat.type"
              @click="activeCategory = cat.type"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="activeCategory === cat.type ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <div class="flex items-center gap-2">
                <component :is="cat.icon" :size="18" />
                <span>{{ cat.label }}</span>
              </div>
              <span class="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {{ getTaskCount(cat.type) }}
              </span>
            </button>
          </div>
        </div>

        <!-- 右侧主内容区 -->
        <div class="flex-1 flex flex-col p-6">
          <!-- 隐藏的文件上传input -->
          <input type="file" ref="fileInput" @change="handleFileSelect" multiple class="hidden" />
          
          <!-- 顶部操作栏 -->
          <div class="flex items-center gap-4 mb-6">
            <button @click="triggerFileUpload" class="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm">
              <Upload :size="16" />
              <span>上传文件</span>
            </button>
            <button @click="showLinkDialog = true" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Link :size="16" />
              <span>分享链接下载</span>
            </button>
          </div>

          <!-- 状态切换和清空 -->
          <div class="flex justify-between items-center border-b border-gray-200 mb-4">
            <div class="flex items-center gap-6">
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
            <button
              @click="showClearConfirm = true"
              :class="[activeStatus === 'completed' ? 'visible' : 'invisible']"
              class="relative -top-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!hasCompletedTasks"
            >
              <Trash2 :size="14" />
              <span>清空全部记录</span>
            </button>
          </div>
          
          <!-- 任务列表 -->
          <div class="flex-1 overflow-auto relative">
             <div v-if="filteredTasks.length === 0" class="absolute inset-0 flex items-center justify-center text-center text-gray-500">
              <div>
                  <FolderOpen :size="64" class="mx-auto mb-4 text-gray-300" />
                  <p>点击<button @click="triggerFileUpload" class="text-teal-600 font-semibold mx-1">上传文件</button>或拖拽/粘贴到空白处上传</p>
              </div>
            </div>
            
            <div class="w-full space-y-3">
              <div v-for="task in filteredTasks" :key="task.id" class="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
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
import { ref, computed } from 'vue';
import { Upload, Download, Link, Trash2, FolderOpen, File as FileIcon, Film, X } from 'lucide-vue-next';
import { useToast } from 'vue-toastification'
import { useDriveStore } from '@/store/DriveStore';
import { useTransferStore } from '@/store/TransferStore';
import type { DriveItem } from '@/store/DriveStore';

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

const categories: { type: CategoryType; label: string; icon: any; }[] = [
  { type: 'upload', label: '上传', icon: Upload },
  { type: 'download', label: '下载', icon: Download },
];

const statuses: { type: StatusType; label: string; }[] = [
  { type: 'progressing', label: '进行中' },
  { type: 'completed', label: '已完成' },
];

const allTasks = ref<Task[]>([]);
let taskIdCounter = 0;

const getTaskCount = (category: CategoryType) => {
  return transferStore.tasks.filter((task: any) => task.type === category).length;
};

const getStatusCount = (status: StatusType) => {
  return transferStore.tasks.filter((task: any) => 
    task.type === activeCategory.value && 
    (status === 'progressing' ? task.status === 'progressing' : task.status === 'completed')
  ).length;
};

const hasCompletedTasks = computed(() => {
  return transferStore.completedTasks.length > 0;
});

const filteredTasks = computed(() => {
  // 使用 TransferStore 的任务，而不是本地的 allTasks
  const storeTasks = transferStore.tasks
  const mappedTasks = storeTasks.map((task: any) => ({
    id: parseInt(task.id.split('-')[1]) || 0,
    name: task.name,
    category: task.type as CategoryType,
    status: task.status === 'progressing' ? 'progressing' as StatusType : 'completed' as StatusType,
    size: transferStore.formatBytes(task.size),
    speed: task.speed,
    progress: task.progress,
    icon: task.type === 'upload' ? Upload : Download
  }))
  
  return mappedTasks.filter((t: any) => 
    t.category === activeCategory.value && 
    t.status === activeStatus.value
  )
});

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getFileType = (name: string): 'audio' | 'document' | 'other' => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) return 'audio';
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) return 'document';
  return 'other';
};

const addToSpecialFolder = (folderName: '上传' | '分享', fileName: string, size: number = 0) => {
  const folder = driveStore.driveItems.find((d: DriveItem) => d.name === folderName && d.type === 'folder');
  if (!folder) return;

  const newFile: DriveItem = {
    id: Date.now().toString() + Math.random().toString(),
    name: fileName,
    type: getFileType(fileName),
    size,
    modifiedAt: new Date(),
    createdAt: new Date(),
    path: `/${folderName}/${fileName}`,
    parentId: folder.id,
  } as DriveItem;

  if (!folder.children) folder.children = [];
  folder.children.push(newFile);
  folder.itemCount = (folder.itemCount || 0) + 1;
};

const addTask = (file: File) => {
  taskIdCounter++;
  const newTask: Task = {
    id: taskIdCounter,
    name: file.name,
    category: 'upload',
    status: 'progressing',
    size: formatBytes(file.size),
    speed: '0 KB/s',
    progress: 0,
    icon: Film, // Could be determined by file type
  };

  allTasks.value.unshift(newTask);
  activeCategory.value = 'upload';
  activeStatus.value = 'progressing';

  const interval = setInterval(() => {
    const task = allTasks.value.find(t => t.id === newTask.id);
    if (task) {
      task.progress += Math.random() * 20; // More realistic progress
      task.speed = formatBytes(Math.random() * 1024 * 1024 * 2) + '/s';
      if (task.progress >= 100) {
        task.progress = 100;
        task.status = 'completed';
        task.speed = '0 KB/s';
        clearInterval(interval);
        task.intervalId = undefined;
        // 上传完成后，将文件加入"上传"文件夹
        addToSpecialFolder('上传', file.name, file.size);
      }
    } else {
      clearInterval(interval);
    }
  }, 500);
  newTask.intervalId = interval as unknown as number;
};

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

const handleClearCompleted = (deleteFiles: boolean) => {
    if (deleteFiles) {
        // Here you would add the actual file deletion logic for all completed tasks
        const completedCount = allTasks.value.filter(t => t.status === 'completed').length;
        toast.success(`${completedCount}个文件的记录和本体已删除`);
    } else {
        toast.success(`所有已完成记录已清空`);
    }
    allTasks.value = allTasks.value.filter(t => t.status !== 'completed');
    showClearConfirm.value = false;
};

const cancelTask = (id: number) => {
    const task = allTasks.value.find(t => t.id === id);
    if (task && task.intervalId) {
        clearInterval(task.intervalId);
    }
    allTasks.value = allTasks.value.filter(t => t.id !== id);
    toast.info('任务已取消');
};

const showDeleteConfirmDialog = (task: Task) => {
    taskToDelete.value = task;
    showDeleteConfirm.value = true;
};

const handleDeleteTask = (deleteFile: boolean) => {
    if (!taskToDelete.value) return;

    if (deleteFile) {
        // Here you would add the actual file deletion logic
        toast.success(`文件 "${taskToDelete.value.name}" 和记录已删除`);
    } else {
        toast.success(`记录 "${taskToDelete.value.name}" 已删除`);
    }

    allTasks.value = allTasks.value.filter(t => t.id !== taskToDelete.value!.id);
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

const startLinkDownload = () => {
  taskIdCounter++;
  const newTask: Task = {
    id: taskIdCounter,
    name: linkUrl.value.split('/').pop() || `下载任务-${taskIdCounter}`,
    category: 'download',
    status: 'progressing',
    size: '未知',
    speed: '0 KB/s',
    progress: 0,
    icon: FileIcon,
  };
  allTasks.value.unshift(newTask);
  activeCategory.value = 'download';
  activeStatus.value = 'progressing';
  showLinkDialog.value = false;
  linkUrl.value = '';

  // Simulate download progress
  const interval = setInterval(() => {
    const task = allTasks.value.find(t => t.id === newTask.id);
    if (task) {
      task.progress += Math.random() * 15;
      task.speed = formatBytes(Math.random() * 1024 * 1024 * 5) + '/s';
      if (task.progress >= 100) {
        task.progress = 100;
        task.status = 'completed';
        task.speed = '0 KB/s';
        clearInterval(interval);
        task.intervalId = undefined;
        // 下载完成后，将文件加入"分享"文件夹（假定下载的是分享文件）
        addToSpecialFolder('分享', newTask.name, 0);
      }
    } else {
      clearInterval(interval);
    }
  }, 500);
  newTask.intervalId = interval as unknown as number;
};

const getStatusText = (status: StatusType) => status === 'progressing' ? '进行中' : '已完成';
</script> 