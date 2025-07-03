<template>
  <div class="min-h-full bg-liteisle-bg p-6">
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
          <!-- 顶部操作栏 -->
          <div class="flex items-center gap-4 mb-6">
            <button @click="addTask" class="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm">
              <Upload :size="16" />
              <span>上传文件</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
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
            <button @click="clearCompleted" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
              <Trash2 :size="14" />
              <span>清空全部记录</span>
            </button>
          </div>
          
          <!-- 任务列表 -->
          <div class="flex-1 overflow-auto">
            <div v-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <FolderOpen :size="64" class="mb-4 text-gray-300" />
              <p>点击<button @click="addTask" class="text-teal-600 font-semibold mx-1">上传文件</button>或拖拽/粘贴到空白处上传</p>
            </div>
            
            <div v-else class="space-y-3">
              <div v-for="task in filteredTasks" :key="task.id" class="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <component :is="task.icon" :size="28" class="text-gray-600" />
                  <div class="flex-1">
                    <p class="font-medium text-gray-800">{{ task.name }}</p>
                    <div class="text-sm text-gray-500 flex items-center gap-4 mt-1">
                       <span>{{ task.size }}</span>
                       <div class="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                         <div class="h-full bg-teal-500" :style="{ width: task.progress + '%' }"></div>
                       </div>
                       <span>{{ task.speed }}</span>
                       <span :class="task.status === 'completed' ? 'text-green-600' : 'text-blue-600'">{{ getStatusText(task.status) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Upload, Download, Link, Trash2, FolderOpen, File as FileIcon, Film } from 'lucide-vue-next';

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
}

const activeCategory = ref<CategoryType>('upload');
const activeStatus = ref<StatusType>('progressing');

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

const getTaskCount = (category: CategoryType) => allTasks.value.filter(t => t.category === category).length;
const getStatusCount = (status: StatusType) => allTasks.value.filter(t => t.category === activeCategory.value && t.status === status).length;

const filteredTasks = computed(() => {
  return allTasks.value.filter(t => t.category === activeCategory.value && t.status === activeStatus.value);
});

const addTask = () => {
  taskIdCounter++;
  const newTask: Task = {
    id: taskIdCounter,
    name: `新上传的文件-${taskIdCounter}.mp4`,
    category: 'upload',
    status: 'progressing',
    size: '1.2 GB',
    speed: '1.5 MB/s',
    progress: 0,
    icon: Film,
  };

  allTasks.value.unshift(newTask);

  const interval = setInterval(() => {
    const task = allTasks.value.find(t => t.id === newTask.id);
    if (task) {
      task.progress += 10;
      if (task.progress >= 100) {
        task.progress = 100;
        task.status = 'completed';
        task.speed = '0 KB/s';
        clearInterval(interval);
      }
    } else {
      clearInterval(interval);
    }
  }, 200);
};

const clearCompleted = () => {
  allTasks.value = allTasks.value.filter(t => t.status !== 'completed');
};

const getStatusText = (status: StatusType) => status === 'progressing' ? '进行中' : '已完成';
</script> 