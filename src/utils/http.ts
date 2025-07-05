import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // 如果是 401 错误且不是刷新 token 的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          // 尝试刷新 token
          const response = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token } = response.data
          
          // 更新 token
          localStorage.setItem('access_token', access_token)
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token)
          }
          
          // 重新发送原始请求
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return http(originalRequest)
        } catch (refreshError) {
          // 刷新失败，清除所有认证信息
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_info')
          
          // 跳转到登录页
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          
          return Promise.reject(refreshError)
        }
      } else {
        // 没有 refresh token，直接跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// 导出 HTTP 实例
export default http

// 导出常用的请求方法
export const get = (url: string, config?: AxiosRequestConfig) => {
  return http.get(url, config)
}

export const post = (url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.post(url, data, config)
}

export const put = (url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.put(url, data, config)
}

export const del = (url: string, config?: AxiosRequestConfig) => {
  return http.delete(url, config)
}

export const patch = (url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.patch(url, data, config)
}

// 认证相关 API
export const authAPI = {
  // 登录 - 参数使用蛇形命名传递给API
  login: (credentials: { email: string; password: string; remember?: boolean }) => {
    return post('/v1/auth/login', credentials)
  },
  
  // 注册 - 参数使用蛇形命名传递给API
  register: (userData: { username: string; email: string; password: string }) => {
    return post('/v1/auth/register', userData)
  },
  
  // 刷新 token - 参数使用蛇形命名传递给API
  refreshToken: (refreshToken: string) => {
    return post('/v1/auth/refresh', { refresh_token: refreshToken })
  },
  
  // 登出
  logout: () => {
    return post('/v1/auth/logout')
  },
  
  // 发送验证码 - 参数使用蛇形命名传递给API
  sendVerificationCode: (email: string, type: 'register' | 'forgot') => {
    return post('/v1/auth/send-verification-code', { email, type })
  },
  
  // 忘记密码 - 参数使用蛇形命名传递给API
  forgotPassword: (data: { username: string; email: string; verification_code: string; new_password: string; confirm_password: string }) => {
    return post('/v1/auth/forgot-password', data)
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return get('/v1/auth/me')
  }
}

// 文件夹管理 API
export const folderAPI = {
  // 获取文件夹列表
  getFolders: (parentId?: number) => {
    const params = parentId ? { parent_id: parentId } : {}
    return get('/v1/folders', { params })
  },
  
  // 创建文件夹
  createFolder: (data: { name: string; parent_id?: number }) => {
    return post('/v1/folders', data)
  },
  
  // 重命名文件夹
  renameFolder: (folderId: number, data: { name: string }) => {
    return put(`/v1/folders/${folderId}`, data)
  },
  
  // 删除文件夹
  deleteFolder: (folderId: number) => {
    return del(`/v1/folders/${folderId}`)
  }
}

// 文件管理 API
export const fileAPI = {
  // 获取文件列表
  getFiles: (folderId?: number, fileType?: string) => {
    const params: any = {}
    if (folderId) params.folder_id = folderId
    if (fileType) params.file_type = fileType
    return get('/v1/files', { params })
  },
  
  // 获取文件详情
  getFileDetail: (fileId: number) => {
    return get(`/v1/files/${fileId}`)
  },
  
  // 下载文件
  downloadFile: (fileId: number) => {
    return get(`/v1/files/${fileId}/download`, { responseType: 'blob' })
  },
  
  // 重命名文件
  renameFile: (fileId: number, data: { name: string }) => {
    return put(`/v1/files/${fileId}`, data)
  },
  
  // 移动文件
  moveFile: (fileId: number, data: { folder_id?: number }) => {
    return put(`/v1/files/${fileId}/move`, data)
  },
  
  // 删除文件
  deleteFile: (fileId: number) => {
    return del(`/v1/files/${fileId}`)
  }
}

// 回收站 API
export const recycleAPI = {
  // 获取回收站内容
  getRecycleItems: () => {
    return get('/v1/recycle')
  },
  
  // 还原文件/文件夹
  restoreItem: (itemId: number) => {
    return post(`/v1/recycle/${itemId}/restore`)
  },
  
  // 彻底删除
  permanentDelete: (itemId: number) => {
    return del(`/v1/recycle/${itemId}`)
  },
  
  // 清空回收站
  clearRecycle: () => {
    return del('/v1/recycle')
  }
}

// 专注功能 API
export const focusAPI = {
  // 获取专注统计信息
  getFocusStats: () => {
    return get('/v1/users/me/focus-stats')
  },
  
  // 记录专注时长
  recordFocus: (data: { focus_minutes: number; session_longest_minutes: number }) => {
    return post('/v1/users/me/focus', data)
  },
  
  // 获取专注日历数据
  getFocusCalendar: (year?: number, month?: number) => {
    const params: any = {}
    if (year) params.year = year
    if (month) params.month = month
    return get('/v1/users/me/focus-calendar', { params })
  }
}

// 岛屿功能 API
export const islandAPI = {
  // 获取用户岛屿收集情况
  getUserIslands: () => {
    return get('/v1/users/me/islands')
  }
}

// 文件上传
export const uploadFile = (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/v1/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

// 导出所有 API
export const API = {
  auth: authAPI,
  folder: folderAPI,
  file: fileAPI,
  recycle: recycleAPI,
  focus: focusAPI,
  island: islandAPI,
  upload: uploadFile
} 