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
          const response = await axios.post('/api/auth/refresh', {
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
  // 登录
  login: (credentials: { email: string; password: string; remember?: boolean }) => {
    return post('/auth/login', credentials)
  },
  
  // 注册
  register: (userData: { username: string; email: string; password: string }) => {
    return post('/auth/register', userData)
  },
  
  // 刷新 token
  refreshToken: (refreshToken: string) => {
    return post('/auth/refresh', { refresh_token: refreshToken })
  },
  
  // 登出
  logout: () => {
    return post('/auth/logout')
  },
  
  // 发送验证码
  sendVerificationCode: (email: string, type: 'register' | 'forgot') => {
    return post('/auth/send-verification-code', { email, type })
  },
  
  // 忘记密码
  forgotPassword: (data: { username: string; email: string; verificationCode: string }) => {
    return post('/auth/forgot-password', data)
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return get('/auth/me')
  }
}

// 文件上传
export const uploadFile = (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/upload', formData, {
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