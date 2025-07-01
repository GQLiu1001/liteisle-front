<template>
  <div class="min-h-full bg-liteisle-bg p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 顶部工具栏 -->
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <!-- 面包屑导航 -->
          <nav class="flex items-center gap-2 text-sm">
            <button
              v-for="(path, index) in breadcrumbPaths"
              :key="index"
              @click="navigateToPath(index)"
              class="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-morandi-100 transition-colors"
              :class="{ 'text-teal-600 font-medium': index === breadcrumbPaths.length - 1 }"
            >
              <Home v-if="index === 0" :size="16" />
              <span>{{ path.name }}</span>
              <ChevronRight v-if="index < breadcrumbPaths.length - 1" :size="16" class="text-morandi-400" />
            </button>
          </nav>

          <!-- 搜索框 -->
          <input
            v-model="searchQuery"
            placeholder="搜索文件..."
            class="px-4 py-2 w-64 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="card">
        <!-- 文件列表头部 -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-morandi-900">
            {{ currentPath === '/' ? '云盘' : currentFolder?.name }}
          </h2>
          <span class="text-sm text-morandi-500">
            {{ filteredItems.length }} 个项目
          </span>
        </div>

        <!-- 网格视图 -->
        <div class="grid grid-cols-6 gap-4">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @click="handleItemClick(item)"
            class="p-4 rounded-lg border-2 border-transparent hover:border-morandi-300 hover:bg-morandi-50 transition-all duration-200 cursor-pointer"
          >
            <!-- 文件图标 -->
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 mb-3 flex items-center justify-center">
                <HardDrive v-if="item.type === 'folder'" :size="48" class="text-blue-500" />
                <Music v-else-if="item.type === 'audio'" :size="48" class="text-green-500" />
                <FileText v-else :size="48" class="text-morandi-500" />
              </div>

              <!-- 文件名 -->
              <p class="text-sm text-center font-medium text-morandi-900 truncate w-full">
                {{ item.name }}
              </p>

              <!-- 文件信息 -->
              <p class="text-xs text-morandi-500 mt-1">
                <span v-if="item.type !== 'folder'">{{ formatFileSize(item.size) }}</span>
                <span v-else>{{ item.itemCount }} 项</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredItems.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-morandi-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive :size="32" class="text-morandi-400" />
          </div>
          <h3 class="text-lg font-medium text-morandi-700 mb-2">
            {{ searchQuery ? '未找到匹配的文件' : '文件夹为空' }}
          </h3>
          <p class="text-morandi-500">
            {{ searchQuery ? '尝试其他搜索词' : '点击文件夹浏览文件' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Home, ChevronRight, HardDrive, Music, FileText } from 'lucide-vue-next'

interface DriveItem {
  id: string
  name: string
  type: 'folder' | 'audio' | 'document' | 'other'
  size: number
  modifiedAt: Date
  path: string
  parentId: string | null
  itemCount?: number
  children?: DriveItem[]
}

interface BreadcrumbPath {
  name: string
  path: string
}

// 响应式数据
const searchQuery = ref('')
const currentPath = ref('/')

// 模拟数据
const driveItems = ref<DriveItem[]>([
  {
    id: '1',
    name: '音乐',
    type: 'folder',
    size: 0,
    modifiedAt: new Date('2024-01-15'),
    path: '/音乐',
    parentId: null,
    itemCount: 3,
    children: [
      {
        id: '1-1',
        name: '我喜欢的',
        type: 'folder',
        size: 0,
        modifiedAt: new Date('2024-01-14'),
        path: '/音乐/我喜欢的',
        parentId: '1',
        itemCount: 5
      },
      {
        id: '1-2',
        name: '古典',
        type: 'folder',
        size: 0,
        modifiedAt: new Date('2024-01-13'),
        path: '/音乐/古典',
        parentId: '1',
        itemCount: 8
      },
      {
        id: '1-3',
        name: 'A.mp3',
        type: 'audio',
        size: 5242880,
        modifiedAt: new Date('2024-01-12'),
        path: '/音乐/A.mp3',
        parentId: '1'
      }
    ]
  },
  {
    id: '2',
    name: '文档',
    type: 'folder',
    size: 0,
    modifiedAt: new Date('2024-01-10'),
    path: '/文档',
    parentId: null,
    itemCount: 12
  },
  {
    id: '3',
    name: '新建文件夹',
    type: 'folder',
    size: 0,
    modifiedAt: new Date('2024-01-08'),
    path: '/新建文件夹',
    parentId: null,
    itemCount: 0
  }
])

// 计算属性
const breadcrumbPaths = computed<BreadcrumbPath[]>(() => {
  const paths = currentPath.value.split('/').filter((p: string) => p)
  const result = [{ name: '云盘', path: '/' }]
  
  let currentFullPath = ''
  paths.forEach((path: string) => {
    currentFullPath += '/' + path
    result.push({ name: path, path: currentFullPath })
  })
  
  return result
})

const currentItems = computed(() => {
  if (currentPath.value === '/') {
    return driveItems.value.filter((item: DriveItem) => item.parentId === null)
  }
  
  const currentFolder = findItemByPath(currentPath.value)
  return currentFolder?.children || []
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return currentItems.value
  
  return currentItems.value.filter((item: DriveItem) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const currentFolder = computed(() => {
  return findItemByPath(currentPath.value)
})

// 辅助函数
const findItemByPath = (path: string): DriveItem | undefined => {
  const pathParts = path.split('/').filter((p: string) => p)
  
  if (pathParts.length === 0) return undefined
  
  let current = driveItems.value.find((item: DriveItem) => item.name === pathParts[0])
  
  for (let i = 1; i < pathParts.length && current; i++) {
    current = current.children?.find((item: DriveItem) => item.name === pathParts[i])
  }
  
  return current
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 事件处理
const navigateToPath = (index: number) => {
  const targetPath = breadcrumbPaths.value[index].path
  currentPath.value = targetPath
}

const handleItemClick = (item: DriveItem) => {
  if (item.type === 'folder') {
    currentPath.value = item.path
  } else {
    console.log('打开文件:', item.name)
  }
}
</script> 