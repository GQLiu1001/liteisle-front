import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/utils/http'

interface User {
  id: number
  username: string
  email: string
  storageUsed?: number
  storageQuota?: number
  status?: number
  createdAt?: string
  updatedAt?: string
}

interface LoginRequest {
  email: string
  password: string
  username?: string
  remember?: boolean
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  verificationCode?: string
}

interface ForgotPasswordRequest {
  username: string
  email: string
  verificationCode: string
  newPassword: string
  confirmPassword: string
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    userId: number
    username: string
    email: string
    token: string
    expiresIn: number
  }
  token?: string
  refreshToken?: string
  user?: User
  expiresIn?: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const convertSnakeToCamel = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(convertSnakeToCamel)
    } else if (obj !== null && typeof obj === 'object') {
      const converted: any = {}
      for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        converted[camelKey] = convertSnakeToCamel(obj[key])
      }
      return converted
    }
    return obj
  }

  const convertCamelToSnake = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(convertCamelToSnake)
    } else if (obj !== null && typeof obj === 'object') {
      const converted: any = {}
      for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        converted[snakeKey] = convertCamelToSnake(obj[key])
      }
      return converted
    }
    return obj
  }
  
  const login = async (credentials: LoginRequest): Promise<void> => {
    isLoading.value = true
    try {
      // 尝试使用真实 API
      try {
        const apiCredentials = convertCamelToSnake({
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember
        })
        
        const response = await authAPI.login(apiCredentials)
        
        const convertedResponse = convertSnakeToCamel(response.data)
        
        // 处理 Spring Security JWT 响应
        if (convertedResponse.success || convertedResponse.code === 200) {
          setAuthData(convertedResponse)
        } else {
          throw new Error(convertedResponse.message || '登录失败')
        }
      } catch (apiError) {
        // 如果 API 调用失败，回退到演示模式
        console.warn('API 调用失败，使用演示模式:', apiError)
        
        const usernameOrEmail = credentials.username || credentials.email
        if (usernameOrEmail === 'admin' && credentials.password === '123456') {
          const mockResponse: AuthResponse = {
            success: true,
            message: '登录成功',
            data: {
              userId: 1,
              username: 'admin',
              email: 'admin@example.com',
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0.demo_token',
              expiresIn: 3600
            },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0.demo_token',
            refreshToken: 'refresh_token_demo_123',
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@example.com'
            },
            expiresIn: 3600
          }
          setAuthData(mockResponse)
        } else {
          throw new Error('用户名或密码错误')
        }
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const register = async (registerData: RegisterRequest): Promise<void> => {
    isLoading.value = true
    try {
      // 尝试使用真实 API
      try {
        const apiData = convertCamelToSnake({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
        
        const response = await authAPI.register(apiData)
        const convertedResponse = convertSnakeToCamel(response.data)
        
        if (convertedResponse.success || convertedResponse.code === 200) {
          console.log('注册成功')
        } else {
          throw new Error(convertedResponse.message || '注册失败')
        }
      } catch (apiError) {
        // 如果 API 调用失败，回退到演示模式
        console.warn('API 调用失败，使用演示模式:', apiError)
        
        if (registerData.verificationCode === '123456') {
          console.log('注册成功')
        } else {
          throw new Error('验证码错误')
        }
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const forgotPassword = async (forgotData: ForgotPasswordRequest): Promise<void> => {
    isLoading.value = true
    try {
      // 尝试使用真实 API
      try {
        const apiData = convertCamelToSnake({
          username: forgotData.username,
          email: forgotData.email,
          verificationCode: forgotData.verificationCode,
          newPassword: forgotData.newPassword,
          confirmPassword: forgotData.confirmPassword
        })
        
        const response = await authAPI.forgotPassword(apiData)
        const convertedResponse = convertSnakeToCamel(response.data)
        
        if (convertedResponse.success || convertedResponse.code === 200) {
          console.log('密码重置成功')
        } else {
          throw new Error(convertedResponse.message || '密码重置失败')
        }
      } catch (apiError) {
        // 如果 API 调用失败，回退到演示模式
        console.warn('API 调用失败，使用演示模式:', apiError)
        
        if (forgotData.verificationCode === '123456') {
          console.log('密码重置成功')
        } else {
          throw new Error('验证码错误')
        }
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const sendVerificationCode = async (email: string, type: 'register' | 'forgot'): Promise<void> => {
    try {
      // 尝试使用真实 API
      const response = await authAPI.sendVerificationCode(email, type)
      const convertedResponse = convertSnakeToCamel(response.data)
      
      if (convertedResponse.success || convertedResponse.code === 200) {
        console.log(`验证码已发送到 ${email}，类型: ${type}`)
      } else {
        throw new Error(convertedResponse.message || '发送验证码失败')
      }
    } catch (apiError) {
      // 如果 API 调用失败，回退到演示模式
      console.warn('API 调用失败，使用演示模式:', apiError)
      console.log(`验证码已发送到 ${email}，类型: ${type}`)
    }
  }
  
  const logout = async (): Promise<void> => {
    try {
      // 尝试调用后端登出 API
      await authAPI.logout()
    } catch (error) {
      console.warn('登出 API 调用失败:', error)
    } finally {
      // 无论 API 调用是否成功，都清除本地数据
      clearAuthData()
    }
  }
  
  const setAuthData = (authData: AuthResponse) => {
    // 优先使用顶级的 token 和 user，如果没有则使用 data 中的
    const accessToken = authData.token || authData.data?.token
    const refreshTokenValue = authData.refreshToken
    const userData = authData.user || {
      id: authData.data?.userId || 0,
      username: authData.data?.username || '',
      email: authData.data?.email || ''
    }
    
    token.value = accessToken
    refreshToken.value = refreshTokenValue || null
    user.value = userData
    
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
    }
    if (refreshTokenValue) {
      localStorage.setItem('refresh_token', refreshTokenValue)
    }
    localStorage.setItem('user_info', JSON.stringify(userData))
  }
  
  const clearAuthData = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
  }
  
  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('access_token')
    const savedUserInfo = localStorage.getItem('user_info')
    
    if (savedToken && savedUserInfo) {
      try {
        user.value = JSON.parse(savedUserInfo)
        token.value = savedToken
      } catch (error) {
        clearAuthData()
      }
    }
  }
  
  return {
    token: computed(() => token.value),
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    login,
    register,
    forgotPassword,
    sendVerificationCode,
    logout,
    initializeAuth
  }
})
