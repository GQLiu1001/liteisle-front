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
      isLocked: true,
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
      isLocked: true,
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
      id: '5',
      name: '上传',
      type: 'folder',
      size: 0,
      modifiedAt: new Date(),
      createdAt: new Date(),
      path: '/上传',
      parentId: null,
      level: 1,
      isLocked: true,
      itemCount: 0,
      children: []
    },
    {
      id: '6',
      name: '分享',
      type: 'folder',
      size: 0,
      modifiedAt: new Date(),
      createdAt: new Date(),
      path: '/分享',
      parentId: null,
      level: 1,
      isLocked: true,
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

  // 获取文件类型
  const getFileType = (fileName: string): DriveItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(ext || '')) return 'audio'
    if (['pdf', 'doc', 'docx', 'txt', 'md', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) return 'document'
    return 'other'
  }

  // 递归查找文件夹
  const findFolderByPath = (path: string): DriveItem | null => {
    if (path === '/') return null

    const pathParts = path.split('/').filter(p => p)
    let current = driveItems.value

    for (const part of pathParts) {
      const folder = current.find(item => item.type === 'folder' && item.name === part)
      if (!folder) return null
      if (folder.children) {
        current = folder.children
      }
      if (pathParts[pathParts.length - 1] === part) {
        return folder
      }
    }
    return null
  }

  // 创建文件夹
  const createFolder = (parentPath: string, folderName: string): DriveItem | null => {
    // 验证文件夹名称
    if (!folderName.trim()) return null

    // 生成新ID
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const now = new Date()
    const fullPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`

    const newFolder: DriveItem = {
      id: newId,
      name: folderName,
      type: 'folder',
      size: 0,
      modifiedAt: now,
      createdAt: now,
      path: fullPath,
      parentId: null,
      itemCount: 0,
      children: []
    }

    if (parentPath === '/') {
      // 添加到根目录
      newFolder.level = 1
      driveItems.value.push(newFolder)
    } else {
      // 添加到指定路径的文件夹
      const parentFolder = findFolderByPath(parentPath)
      if (!parentFolder) return null

      newFolder.parentId = parentFolder.id
      newFolder.level = (parentFolder.level || 1) + 1
      
      if (!parentFolder.children) parentFolder.children = []
      parentFolder.children.push(newFolder)
      parentFolder.itemCount = (parentFolder.itemCount || 0) + 1
      parentFolder.modifiedAt = now
    }

    return newFolder
  }

  // 添加文件到指定路径
  const addFileToPath = (targetPath: string, file: File): DriveItem | null => {
    const folder = findFolderByPath(targetPath)
    if (!folder) return null

    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const now = new Date()
    const filePath = `${targetPath}/${file.name}`

    const newFile: DriveItem = {
      id: newId,
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      modifiedAt: now,
      createdAt: now,
      path: filePath,
      parentId: folder.id
    }

    if (!folder.children) folder.children = []
    folder.children.push(newFile)
    folder.itemCount = (folder.itemCount || 0) + 1
    folder.modifiedAt = now

    return newFile
  }

  // 在音乐文件夹下创建播放列表文件夹
  const createMusicPlaylist = (playlistName: string): DriveItem | null => {
    return createFolder('/音乐', playlistName)
  }

  // 在文档文件夹下创建分类文件夹
  const createDocumentCategory = (categoryName: string): DriveItem | null => {
    return createFolder('/文档', categoryName)
  }

  // 上传音乐文件到指定播放列表
  const uploadMusicToPlaylist = (playlistName: string, files: File[]): DriveItem[] => {
    const targetPath = `/音乐/${playlistName}`
    const uploadedFiles: DriveItem[] = []

    for (const file of files) {
      const uploadedFile = addFileToPath(targetPath, file)
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile)
      }
    }

    return uploadedFiles
  }

  // 上传文档文件到指定分类
  const uploadDocumentToCategory = (categoryName: string, files: File[]): DriveItem[] => {
    const targetPath = `/文档/${categoryName}`
    const uploadedFiles: DriveItem[] = []

    for (const file of files) {
      const uploadedFile = addFileToPath(targetPath, file)
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile)
      }
    }

    return uploadedFiles
  }

  // 删除项目
  const deleteItem = (itemId: string): boolean => {
    const findAndDeleteItem = (items: DriveItem[], isRecycleBin: boolean = false): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.id === itemId) {
          if (isRecycleBin) {
            // 在回收站中，永久删除
            items.splice(i, 1)
          } else {
            // 正常模式，移动到回收站
            items.splice(i, 1)
            item.deletedAt = new Date()
            recycleBinItems.value.push(item)
            
            // 更新父文件夹的项目计数
            const parentPath = item.path.split('/').slice(0, -1).join('/') || '/'
            const parent = findFolderByPath(parentPath)
            if (parent) {
              parent.itemCount = (parent.itemCount || 1) - 1
              parent.modifiedAt = new Date()
            }
          }
          return true
        }
        
        // 递归搜索子项
        if (item.children && findAndDeleteItem(item.children, isRecycleBin)) {
          // 更新父文件夹的项目计数
          if (!isRecycleBin) {
            item.itemCount = (item.itemCount || 1) - 1
            item.modifiedAt = new Date()
          }
          return true
        }
      }
      return false
    }
    
    if (isInRecycleBin.value) {
      // 在回收站中，永久删除
      return findAndDeleteItem(recycleBinItems.value, true)
    } else {
      // 正常模式，移动到回收站
      return findAndDeleteItem(driveItems.value, false)
    }
  }

  // 重命名项目
  const renameItem = (itemId: string, newName: string): boolean => {
    const findAndRenameItem = (items: DriveItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId) {
          const oldName = item.name
          const pathParts = item.path.split('/')
          pathParts[pathParts.length - 1] = newName
          const newPath = pathParts.join('/')
          
          // 更新项目信息
          item.name = newName
          item.path = newPath
          item.modifiedAt = new Date()
          
          // 如果是文件夹，需要递归更新所有子项的路径
          if (item.type === 'folder' && item.children) {
            const updateChildrenPaths = (children: DriveItem[], oldBasePath: string, newBasePath: string) => {
              children.forEach(child => {
                child.path = child.path.replace(oldBasePath, newBasePath)
                if (child.type === 'folder' && child.children) {
                  updateChildrenPaths(child.children, oldBasePath, newBasePath)
                }
              })
            }
            updateChildrenPaths(item.children, `${pathParts.slice(0, -1).join('/')}/${oldName}`, newPath)
          }
          
          return true
        }
        
        // 递归搜索子项
        if (item.children && findAndRenameItem(item.children)) {
          return true
        }
      }
      return false
    }
    
    // 先在主列表中查找
    if (findAndRenameItem(driveItems.value)) {
      return true
    }
    
    // 再在回收站中查找
    if (findAndRenameItem(recycleBinItems.value)) {
      return true
    }
    
    return false
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
    deleteItem,
    
    // 新增方法
    createFolder,
    addFileToPath,
    createMusicPlaylist,
    createDocumentCategory,
    uploadMusicToPlaylist,
    uploadDocumentToCategory,
    findFolderByPath,
    getFileType,
    renameItem
  }
})