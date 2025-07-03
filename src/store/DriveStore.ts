import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DriveItem {
  id: string
  name: string
  type: 'folder' | 'audio' | 'document' | 'other'
  size: number
  modifiedAt: Date
  createdAt: Date
  path: string
  parentId: string | null
  itemCount?: number
  children?: DriveItem[]
  level?: number
  deletedAt?: Date
}

export const useDriveStore = defineStore('drive', () => {
  // 响应式数据
  const searchQuery = ref('')
  const currentPath = ref('/')
  const isInRecycleBin = ref(false)
  
  // 回收站数据
  const recycleBinItems = ref<DriveItem[]>([
    {
      id: 'recycle-1',
      name: '已删除的照片.jpg',
      type: 'other',
      size: 2048576,
      modifiedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-08'),
      path: '/图片/已删除的照片.jpg',
      parentId: '4',
      deletedAt: new Date('2024-01-12')
    },
    {
      id: 'recycle-2',
      name: '旧文档',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-08'),
      createdAt: new Date('2024-01-06'),
      path: '/文档/旧文档',
      parentId: '2',
      itemCount: 3,
      deletedAt: new Date('2024-01-11')
    }
  ])

  // 主要网盘数据
  const driveItems = ref<DriveItem[]>([
    {
      id: '1',
      name: '音乐',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-01'),
      path: '/音乐',
      parentId: null,
      level: 1,
      itemCount: 3,
      children: [
        {
          id: '1-1',
          name: '我喜欢的',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-14'),
          createdAt: new Date('2024-01-02'),
          path: '/音乐/我喜欢的',
          parentId: '1',
          level: 2,
          itemCount: 2,
          children: [
            {
              id: '1-1-1',
              name: '夜曲.mp3',
              type: 'audio',
              size: 5242880,
              modifiedAt: new Date('2024-01-12'),
              createdAt: new Date('2024-01-05'),
              path: '/音乐/我喜欢的/夜曲.mp3',
              parentId: '1-1'
            },
            {
              id: '1-1-2',
              name: '蓝莲花.mp3',
              type: 'audio',
              size: 4536320,
              modifiedAt: new Date('2024-01-11'),
              createdAt: new Date('2024-01-06'),
              path: '/音乐/我喜欢的/蓝莲花.mp3',
              parentId: '1-1'
            }
          ]
        },
        {
          id: '1-2',
          name: '古典音乐',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-13'),
          createdAt: new Date('2024-01-03'),
          path: '/音乐/古典音乐',
          parentId: '1',
          level: 2,
          itemCount: 1,
          children: [
            {
              id: '1-2-1',
              name: '贝多芬第九交响曲.mp3',
              type: 'audio',
              size: 8912345,
              modifiedAt: new Date('2024-01-10'),
              createdAt: new Date('2024-01-07'),
              path: '/音乐/古典音乐/贝多芬第九交响曲.mp3',
              parentId: '1-2'
            }
          ]
        },
        {
          id: '1-3',
          name: '摇滚音乐',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-16'),
          createdAt: new Date('2024-01-04'),
          path: '/音乐/摇滚音乐',
          parentId: '1',
          level: 2,
          itemCount: 2,
          children: [
            {
              id: '1-3-1',
              name: '光辉岁月.mp3',
              type: 'audio',
              size: 6234567,
              modifiedAt: new Date('2024-01-09'),
              createdAt: new Date('2024-01-08'),
              path: '/音乐/摇滚音乐/光辉岁月.mp3',
              parentId: '1-3'
            },
            {
              id: '1-3-2',
              name: '海阔天空.mp3',
              type: 'audio',
              size: 7345678,
              modifiedAt: new Date('2024-01-08'),
              createdAt: new Date('2024-01-09'),
              path: '/音乐/摇滚音乐/海阔天空.mp3',
              parentId: '1-3'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: '文档',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-10'),
      createdAt: new Date('2023-12-15'),
      path: '/文档',
      parentId: null,
      level: 1,
      itemCount: 2,
      children: [
        {
          id: '2-1',
          name: '图书',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-20'),
          createdAt: new Date('2024-01-18'),
          path: '/文档/图书',
          parentId: '2',
          level: 2,
          itemCount: 3,
          children: [
            {
              id: 'doc-pdf-1',
              name: 'Vue 3 开发指南.pdf',
              type: 'document',
              size: 15728640,
              modifiedAt: new Date('2024-01-20'),
              createdAt: new Date('2024-01-19'),
              path: '/文档/图书/Vue 3 开发指南.pdf',
              parentId: '2-1'
            },
            {
              id: 'doc-md-1',
              name: '设计模式.md',
              type: 'document',
              size: 1048576,
              modifiedAt: new Date('2024-01-15'),
              createdAt: new Date('2024-01-14'),
              path: '/文档/图书/设计模式.md',
              parentId: '2-1'
            },
            {
              id: 'doc-docx-1',
              name: 'Node.js开发实战.docx',
              type: 'document',
              size: 12582912,
              modifiedAt: new Date('2024-01-23'),
              createdAt: new Date('2024-01-22'),
              path: '/文档/图书/Node.js开发实战.docx',
              parentId: '2-1'
            }
          ]
        },
        {
          id: '2-2',
          name: '笔记',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-22'),
          createdAt: new Date('2024-01-21'),
          path: '/文档/笔记',
          parentId: '2',
          level: 2,
          itemCount: 1,
          children: [
            {
              id: 'doc-md-2',
              name: '学习计划.md',
              type: 'document',
              size: 2048,
              modifiedAt: new Date('2024-01-22'),
              createdAt: new Date('2024-01-21'),
              path: '/文档/笔记/学习计划.md',
              parentId: '2-2'
            }
          ]
        }
      ]
    },
    {
      id: '3',
      name: '视频',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-08'),
      createdAt: new Date('2023-12-20'),
      path: '/视频',
      parentId: null,
      level: 1,
      itemCount: 0,
      children: []
    },
    {
      id: '4',
      name: '图片',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-05'),
      createdAt: new Date('2023-12-25'),
      path: '/图片',
      parentId: null,
      level: 1,
      itemCount: 0,
      children: []
    }
  ])

  // Computed property to get items based on the current path
  const currentLevelItems = computed(() => {
    if (currentPath.value === '/') {
      return driveItems.value
    }

    const pathParts = currentPath.value.split('/').filter(p => p)
    let currentItems = driveItems.value

    for (const part of pathParts) {
      const folder = currentItems.find(item => item.type === 'folder' && item.name === part)
      if (folder && folder.children) {
        currentItems = folder.children
      } else {
        return [] // Path not found
      }
    }
    return currentItems
  })

  // 基本操作方法
  const setCurrentPath = (path: string) => {
    currentPath.value = path
    isInRecycleBin.value = false
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const openRecycleBin = () => {
    isInRecycleBin.value = true
  }

  const exitRecycleBin = () => {
    isInRecycleBin.value = false
  }

  // 恢复项目
  const restoreItem = (itemId: string) => {
    const itemIndex = recycleBinItems.value.findIndex(i => i.id === itemId)
    if (itemIndex === -1) return

    const itemToRestore = recycleBinItems.value[itemIndex]
    recycleBinItems.value.splice(itemIndex, 1)

    // 尝试在 driveItems 中递归查找父项
    const findParent = (items: DriveItem[], parentId: string | null): DriveItem | null => {
      if (!parentId) return null
      for (const item of items) {
        if (item.id === parentId) {
          return item
        }
        if (item.children) {
          const found = findParent(item.children, parentId)
          if (found) return found
        }
      }
      return null
    }

    const parent = findParent(driveItems.value, itemToRestore.parentId)

    if (parent && parent.children) {
      // 恢复到原父级
      parent.children.push(itemToRestore)
      parent.itemCount = (parent.itemCount || 0) + 1
    } else {
      // 如果找不到父级，恢复到根目录
      driveItems.value.push(itemToRestore)
    }
  }

  return {
    // 状态
    driveItems,
    recycleBinItems,
    searchQuery,
    currentPath,
    isInRecycleBin,
    
    // Computed
    currentLevelItems,

    // 方法  
    setCurrentPath,
    setSearchQuery,
    openRecycleBin,
    exitRecycleBin,
    restoreItem,
  }
})