import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDriveStore, type DriveItem } from './DriveStore'

export interface TransferTask {
  id: string
  name: string
  type: 'upload' | 'download'
  status: 'pending' | 'progressing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  size: number
  speed: string
  targetPath: string
  file?: File
  createdAt: Date
  completedAt?: Date
}

export const useTransferStore = defineStore('transfer', () => {
  const tasks = ref<TransferTask[]>([])
  let taskIdCounter = 0

  // 计算属性
  const uploadTasks = computed(() => tasks.value.filter(t => t.type === 'upload'))
  const downloadTasks = computed(() => tasks.value.filter(t => t.type === 'download'))
  const progressingTasks = computed(() => tasks.value.filter(t => t.status === 'progressing'))
  const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))

  // 格式化文件大小
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // 创建上传任务
  const createUploadTask = (file: File, targetPath: string): TransferTask => {
    taskIdCounter++
    const task: TransferTask = {
      id: `upload-${taskIdCounter}`,
      name: file.name,
      type: 'upload',
      status: 'pending',
      progress: 0,
      size: file.size,
      speed: '0 KB/s',
      targetPath,
      file,
      createdAt: new Date()
    }
    
    tasks.value.unshift(task)
    return task
  }

  // 开始上传任务
  const startUpload = async (taskId: string): Promise<boolean> => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || task.type !== 'upload' || !task.file) return false

    task.status = 'progressing'
    
    return new Promise((resolve) => {
      // 模拟上传进度
      const interval = setInterval(() => {
        if (task.status === 'cancelled') {
          clearInterval(interval)
          resolve(false)
          return
        }

        task.progress += Math.random() * 15 + 5 // 5-20% per step
        task.speed = formatBytes(Math.random() * 1024 * 1024 * 3) + '/s' // 0-3MB/s

        if (task.progress >= 100) {
          task.progress = 100
          task.status = 'completed'
          task.speed = '0 KB/s'
          task.completedAt = new Date()
          clearInterval(interval)
          
          // 上传完成后，添加文件到云盘
          addFileToDrive(task)
          resolve(true)
        }
      }, 500)
    })
  }

  // 批量上传文件
  const uploadFiles = async (files: File[], targetPath: string) => {
    const tasks: TransferTask[] = []
    
    // 创建所有上传任务
    for (const file of files) {
      const task = createUploadTask(file, targetPath)
      tasks.push(task)
    }
    
    // 开始上传（可以并行或串行）
    for (const task of tasks) {
      startUpload(task.id)
    }
    
    return tasks
  }

  // 取消任务
  const cancelTask = (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.status === 'progressing') {
      task.status = 'cancelled'
    }
  }

  // 删除任务记录
  const removeTask = (taskId: string) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  // 清空已完成的任务
  const clearCompletedTasks = () => {
    tasks.value = tasks.value.filter(t => t.status !== 'completed')
  }

  // 将上传完成的文件添加到云盘
  const addFileToDrive = (task: TransferTask) => {
    if (!task.file) return
    
    const driveStore = useDriveStore()
    driveStore.addFileToPath(task.targetPath, task.file)
  }

  // 获取指定类型和状态的任务数量
  const getTaskCount = (type?: 'upload' | 'download', status?: TransferTask['status']) => {
    let filtered = tasks.value
    if (type) filtered = filtered.filter(t => t.type === type)
    if (status) filtered = filtered.filter(t => t.status === status)
    return filtered.length
  }

  return {
    // 状态
    tasks,
    
    // 计算属性
    uploadTasks,
    downloadTasks,
    progressingTasks,
    completedTasks,
    
    // 方法
    createUploadTask,
    startUpload,
    uploadFiles,
    cancelTask,
    removeTask,
    clearCompletedTasks,
    getTaskCount,
    formatBytes
  }
}) 