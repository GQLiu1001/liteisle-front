import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DriveItem {
  id: number
  name: string
  type: 'folder' | 'audio' | 'document' | 'other'
  size: number
  modifiedAt: Date
  createdAt: Date
  path: string
  parentId: number | null // 0表示根目录
  storageId?: number // 关联的存储记录ID（用于文件去重）
  itemCount?: number
  children?: DriveItem[]
  level?: number
  deletedAt?: Date
  isLocked?: boolean
}

export const useDriveStore = defineStore('drive', () => {
  // 响应式数据
  const searchQuery = ref('')
  const currentPath = ref('/')
  const isInRecycleBin = ref(false)
  
  // 回收站数据
  const recycleBinItems = ref<DriveItem[]>([
    {
      id: 1001,
      name: '已删除的照片.jpg',
      type: 'other',
      size: 2048576,
      modifiedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-08'),
      path: '/图片/已删除的照片.jpg',
      parentId: 4,
      storageId: 101,
      deletedAt: new Date('2024-01-12')
    },
    {
      id: 1002,
      name: '旧文档',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-08'),
      createdAt: new Date('2024-01-06'),
      path: '/文档/旧文档',
      parentId: 2,
      itemCount: 3,
      deletedAt: new Date('2024-01-11')
    }
  ])

  // 主要网盘数据
  const driveItems = ref<DriveItem[]>([
    {
      id: 1,
      name: '音乐',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-01'),
      path: '/音乐',
      parentId: 0, // 根目录
      level: 1,
      isLocked: true,
      itemCount: 3,
      children: [
        {
          id: 11,
          name: '我喜欢的',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-14'),
          createdAt: new Date('2024-01-02'),
          path: '/音乐/我喜欢的',
          parentId: 1,
          level: 2,
          itemCount: 2,
          children: [
            {
              id: 111,
              name: '夜曲.mp3',
              type: 'audio',
              size: 5242880,
              modifiedAt: new Date('2024-01-12'),
              createdAt: new Date('2024-01-05'),
              path: '/音乐/我喜欢的/夜曲.mp3',
              parentId: 11,
              storageId: 201
            },
            {
              id: 112,
              name: '蓝莲花.mp3',
              type: 'audio',
              size: 4536320,
              modifiedAt: new Date('2024-01-11'),
              createdAt: new Date('2024-01-06'),
              path: '/音乐/我喜欢的/蓝莲花.mp3',
              parentId: 11,
              storageId: 202
            }
          ]
        },
        {
          id: 12,
          name: '古典音乐',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-13'),
          createdAt: new Date('2024-01-03'),
          path: '/音乐/古典音乐',
          parentId: 1,
          level: 2,
          itemCount: 1,
          children: [
            {
              id: 121,
              name: '贝多芬第九交响曲.mp3',
              type: 'audio',
              size: 8912345,
              modifiedAt: new Date('2024-01-10'),
              createdAt: new Date('2024-01-07'),
              path: '/音乐/古典音乐/贝多芬第九交响曲.mp3',
              parentId: 12,
              storageId: 203
            }
          ]
        },
        {
          id: 13,
          name: '摇滚音乐',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-16'),
          createdAt: new Date('2024-01-04'),
          path: '/音乐/摇滚音乐',
          parentId: 1,
          level: 2,
          itemCount: 2,
          children: [
            {
              id: 131,
              name: '光辉岁月.mp3',
              type: 'audio',
              size: 6234567,
              modifiedAt: new Date('2024-01-09'),
              createdAt: new Date('2024-01-08'),
              path: '/音乐/摇滚音乐/光辉岁月.mp3',
              parentId: 13,
              storageId: 204
            },
            {
              id: 132,
              name: '海阔天空.mp3',
              type: 'audio',
              size: 7345678,
              modifiedAt: new Date('2024-01-08'),
              createdAt: new Date('2024-01-09'),
              path: '/音乐/摇滚音乐/海阔天空.mp3',
              parentId: 13,
              storageId: 205
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: '文档',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-10'),
      createdAt: new Date('2023-12-15'),
      path: '/文档',
      parentId: 0, // 根目录
      level: 1,
      isLocked: true,
      itemCount: 2,
      children: [
        {
          id: 21,
          name: '图书',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-20'),
          createdAt: new Date('2024-01-18'),
          path: '/文档/图书',
          parentId: 2,
          level: 2,
          itemCount: 3,
          children: [
            {
              id: 211,
              name: 'Vue 3 开发指南.pdf',
              type: 'document',
              size: 15728640,
              modifiedAt: new Date('2024-01-20'),
              createdAt: new Date('2024-01-19'),
              path: '/文档/图书/Vue 3 开发指南.pdf',
              parentId: 21,
              storageId: 301
            },
            {
              id: 212,
              name: '设计模式.md',
              type: 'document',
              size: 2048576,
              modifiedAt: new Date('2024-01-19'),
              createdAt: new Date('2024-01-18'),
              path: '/文档/图书/设计模式.md',
              parentId: 21,
              storageId: 302
            },
            {
              id: 213,
              name: 'JavaScript高级程序设计.pdf',
              type: 'document',
              size: 25165824,
              modifiedAt: new Date('2024-01-18'),
              createdAt: new Date('2024-01-17'),
              path: '/文档/图书/JavaScript高级程序设计.pdf',
              parentId: 21,
              storageId: 303
            }
          ]
        },
        {
          id: 22,
          name: '工作文档',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-15'),
          createdAt: new Date('2024-01-10'),
          path: '/文档/工作文档',
          parentId: 2,
          level: 2,
          itemCount: 3,
          children: [
            {
              id: 221,
              name: '项目计划.docx',
              type: 'document',
              size: 1048576,
              modifiedAt: new Date('2024-01-15'),
              createdAt: new Date('2024-01-12'),
              path: '/文档/工作文档/项目计划.docx',
              parentId: 22,
              storageId: 304
            },
            {
              id: 222,
              name: '会议记录.md',
              type: 'document',
              size: 512000,
              modifiedAt: new Date('2024-01-14'),
              createdAt: new Date('2024-01-13'),
              path: '/文档/工作文档/会议记录.md',
              parentId: 22,
              storageId: 305
            },
            {
              id: 223,
              name: '需求文档.pdf',
              type: 'document',
              size: 3145728,
              modifiedAt: new Date('2024-01-13'),
              createdAt: new Date('2024-01-11'),
              path: '/文档/工作文档/需求文档.pdf',
              parentId: 22,
              storageId: 306
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: '下载',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-12'),
      createdAt: new Date('2023-11-20'),
      path: '/学习资料',
      parentId: 0, // 根目录
      level: 1,
      itemCount: 5,
      children: [
        {
          id: 31,
          name: '前端开发',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-12'),
          createdAt: new Date('2023-12-01'),
          path: '/学习资料/前端开发',
          parentId: 3,
          level: 2,
          itemCount: 2,
          children: [
            {
              id: 311,
              name: 'React学习笔记.md',
              type: 'document',
              size: 1024000,
              modifiedAt: new Date('2024-01-12'),
              createdAt: new Date('2023-12-05'),
              path: '/学习资料/前端开发/React学习笔记.md',
              parentId: 31,
              storageId: 401
            },
            {
              id: 312,
              name: 'TypeScript入门.pdf',
              type: 'document',
              size: 8388608,
              modifiedAt: new Date('2024-01-10'),
              createdAt: new Date('2023-12-08'),
              path: '/学习资料/前端开发/TypeScript入门.pdf',
              parentId: 31,
              storageId: 402
            }
          ]
        },
        {
          id: 32,
          name: '视频教程.mp4',
          type: 'other',
          size: 104857600,
          modifiedAt: new Date('2024-01-08'),
          createdAt: new Date('2023-12-15'),
          path: '/学习资料/视频教程.mp4',
          parentId: 3,
          storageId: 403
        },
        {
          id: 33,
          name: '编程练习.zip',
          type: 'other',
          size: 2097152,
          modifiedAt: new Date('2024-01-05'),
          createdAt: new Date('2023-12-20'),
          path: '/学习资料/编程练习.zip',
          parentId: 3,
          storageId: 404
        },
        {
          id: 34,
          name: '算法题解.md',
          type: 'document',
          size: 1536000,
          modifiedAt: new Date('2024-01-03'),
          createdAt: new Date('2023-12-25'),
          path: '/学习资料/算法题解.md',
          parentId: 3,
          storageId: 405
        },
        {
          id: 35,
          name: '面试准备.docx',
          type: 'document',
          size: 2048000,
          modifiedAt: new Date('2024-01-01'),
          createdAt: new Date('2023-12-30'),
          path: '/学习资料/面试准备.docx',
          parentId: 3,
          storageId: 406
        }
      ]
    },
    {
      id: 4,
      name: '分享',
      type: 'folder',
      size: 0,
      modifiedAt: new Date('2024-01-05'),
      createdAt: new Date('2023-10-15'),
      path: '/图片',
      parentId: 0, // 根目录
      level: 1,
      itemCount: 3,
      children: [
        {
          id: 41,
          name: '风景照.jpg',
          type: 'other',
          size: 3145728,
          modifiedAt: new Date('2024-01-05'),
          createdAt: new Date('2023-11-01'),
          path: '/图片/风景照.jpg',
          parentId: 4,
          storageId: 501
        },
        {
          id: 42,
          name: '头像.png',
          type: 'other',
          size: 512000,
          modifiedAt: new Date('2024-01-03'),
          createdAt: new Date('2023-11-05'),
          path: '/图片/头像.png',
          parentId: 4,
          storageId: 502
        },
        {
          id: 43,
          name: '截图.png',
          type: 'other',
          size: 1048576,
          modifiedAt: new Date('2024-01-01'),
          createdAt: new Date('2023-11-10'),
          path: '/图片/截图.png',
          parentId: 4,
          storageId: 503
        }
      ]
    }
  ])

  // 计算属性
  const currentItems = computed(() => {
    if (isInRecycleBin.value) {
      return recycleBinItems.value.filter(item => 
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    const filterItems = (items: DriveItem[]): DriveItem[] => {
      return items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        if (item.children) {
          item.children = filterItems(item.children)
        }
        return matchesSearch || (item.children && item.children.length > 0)
      })
    }
    
    if (searchQuery.value) {
      return filterItems([...driveItems.value])
    }
    
    if (currentPath.value === '/') {
      return driveItems.value
    }
    
    const folder = findFolderByPath(currentPath.value)
    return folder?.children || []
  })

  // 方法
  const setCurrentPath = (path: string) => {
    currentPath.value = path
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

  const restoreItem = (itemId: number) => {
    const index = recycleBinItems.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      const item = recycleBinItems.value[index]
      recycleBinItems.value.splice(index, 1)
      
      // 将项目恢复到原位置
      const findParent = (items: DriveItem[], parentId: number | null): DriveItem | null => {
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
      
      delete item.deletedAt
      const parent = findParent(driveItems.value, item.parentId)
      if (parent && parent.children) {
        parent.children.push(item)
        parent.itemCount = (parent.itemCount || 0) + 1
      } else if (item.parentId === 0) {
        driveItems.value.push(item)
      }
      
      return true
    }
    return false
  }

  const getFileType = (fileName: string): DriveItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(ext || '')) return 'audio'
    if (['pdf', 'doc', 'docx', 'txt', 'md', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) return 'document'
    return 'other'
  }

  const findFolderByPath = (path: string): DriveItem | null => {
    if (path === '/') return null
    
    const pathParts = path.split('/').filter(part => part !== '')
    let current: DriveItem[] = driveItems.value
    
    for (const part of pathParts) {
      const found = current.find(item => item.name === part && item.type === 'folder')
      if (!found || !found.children) return null
      current = found.children
      if (pathParts.indexOf(part) === pathParts.length - 1) {
        return found
      }
    }
    
    return null
  }

  const createFolder = (parentPath: string, folderName: string): DriveItem | null => {
    const newId = Math.max(...driveItems.value.map(item => item.id), 0) + 1
    const newFolder: DriveItem = {
      id: newId,
      name: folderName,
      type: 'folder',
      size: 0,
      modifiedAt: new Date(),
      createdAt: new Date(),
      path: parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`,
      parentId: parentPath === '/' ? 0 : null,
      level: parentPath === '/' ? 1 : 2,
      itemCount: 0,
      children: []
    }
    
    if (parentPath === '/') {
      driveItems.value.push(newFolder)
    } else {
      const parent = findFolderByPath(parentPath)
      if (parent && parent.children) {
        // 设置正确的parentId
        newFolder.parentId = parent.id
        newFolder.level = (parent.level || 1) + 1
        
        parent.children.push(newFolder)
        parent.itemCount = (parent.itemCount || 0) + 1
      } else {
        return null
      }
    }
    
    return newFolder
  }

  const addFileToPath = (targetPath: string, file: File): DriveItem | null => {
    const newId = Math.max(...driveItems.value.map(item => item.id), 0) + 1
    const storageId = Math.floor(Math.random() * 1000) + 1000 // 模拟storageId
    
    const newFile: DriveItem = {
      id: newId,
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      modifiedAt: new Date(),
      createdAt: new Date(),
      path: targetPath === '/' ? `/${file.name}` : `${targetPath}/${file.name}`,
      parentId: targetPath === '/' ? 0 : null,
      storageId: storageId
    }
    
    if (targetPath === '/') {
      driveItems.value.push(newFile)
    } else {
      const parent = findFolderByPath(targetPath)
      if (parent && parent.children) {
        newFile.parentId = parent.id
        parent.children.push(newFile)
        parent.itemCount = (parent.itemCount || 0) + 1
      } else {
        return null
      }
    }
    
    return newFile
  }

  const createMusicPlaylist = (playlistName: string): DriveItem | null => {
    return createFolder('/音乐', playlistName)
  }

  const createDocumentCategory = (categoryName: string): DriveItem | null => {
    return createFolder('/文档', categoryName)
  }

  const uploadMusicToPlaylist = (playlistName: string, files: File[]): DriveItem[] => {
    const uploadedFiles: DriveItem[] = []
    const targetPath = `/音乐/${playlistName}`
    
    for (const file of files) {
      const uploadedFile = addFileToPath(targetPath, file)
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile)
      }
    }
    
    return uploadedFiles
  }

  const uploadDocumentToCategory = (categoryName: string, files: File[]): DriveItem[] => {
    const uploadedFiles: DriveItem[] = []
    const targetPath = `/文档/${categoryName}`
    
    for (const file of files) {
      const uploadedFile = addFileToPath(targetPath, file)
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile)
      }
    }
    
    return uploadedFiles
  }

  const deleteItem = (itemId: number): boolean => {
    const findAndDeleteItem = (items: DriveItem[], isRecycleBin: boolean = false): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        if (item.id === itemId) {
          if (isRecycleBin) {
            // 回收站中永久删除
            items.splice(i, 1)
          } else {
            // 移动到回收站
            const deletedItem = { ...item, deletedAt: new Date() }
            items.splice(i, 1)
            recycleBinItems.value.push(deletedItem)
            
            // 更新父文件夹的itemCount
            if (item.parentId !== 0) {
              const findParent = (parentItems: DriveItem[], targetParentId: number | null): void => {
                for (const parentItem of parentItems) {
                  if (parentItem.id === targetParentId) {
                    parentItem.itemCount = Math.max((parentItem.itemCount || 1) - 1, 0)
                    return
                  }
                  if (parentItem.children) {
                    findParent(parentItem.children, targetParentId)
                  }
                }
              }
              findParent(driveItems.value, item.parentId)
            }
          }
          return true
        }
        
        if (item.children && findAndDeleteItem(item.children, isRecycleBin)) {
          return true
        }
      }
      return false
    }
    
    if (isInRecycleBin.value) {
      return findAndDeleteItem(recycleBinItems.value, true)
    } else {
      return findAndDeleteItem(driveItems.value, false)
    }
  }

  const renameItem = (itemId: number, newName: string): boolean => {
    const findAndRenameItem = (items: DriveItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId) {
          const oldPath = item.path
          const pathParts = oldPath.split('/')
          pathParts[pathParts.length - 1] = newName
          const newPath = pathParts.join('/')
          
          item.name = newName
          item.path = newPath
          item.modifiedAt = new Date()
          
          // 如果是文件夹，更新所有子项的路径
          if (item.type === 'folder' && item.children) {
            const updateChildrenPaths = (children: DriveItem[], oldBasePath: string, newBasePath: string) => {
              for (const child of children) {
                child.path = child.path.replace(oldBasePath, newBasePath)
                if (child.children) {
                  updateChildrenPaths(child.children, oldBasePath, newBasePath)
                }
              }
            }
            updateChildrenPaths(item.children, oldPath, newPath)
          }
          
          return true
        }
        
        if (item.children && findAndRenameItem(item.children)) {
          return true
        }
      }
      return false
    }
    
    if (isInRecycleBin.value) {
      return findAndRenameItem(recycleBinItems.value)
    } else {
      return findAndRenameItem(driveItems.value)
    }
  }

  return {
    // 状态
    searchQuery,
    currentPath,
    isInRecycleBin,
    driveItems,
    recycleBinItems,
    
    // 计算属性
    currentItems,
    
    // 方法
    setCurrentPath,
    setSearchQuery,
    openRecycleBin,
    exitRecycleBin,
    restoreItem,
    getFileType,
    findFolderByPath,
    createFolder,
    addFileToPath,
    createMusicPlaylist,
    createDocumentCategory,
    uploadMusicToPlaylist,
    uploadDocumentToCategory,
    deleteItem,
    renameItem
  }
})