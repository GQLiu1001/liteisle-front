import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
  email: string
  roles: string[]
}

interface LoginRequest {
  username: string
  password: string
  remember: boolean
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  verificationCode: string
}

interface ForgotPasswordRequest {
  username: string
  email: string
  verificationCode: string
}

interface AuthResponse {
  token: string
  refreshToken: string
  user: User
  expiresIn: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const login = async (credentials: LoginRequest): Promise<void> => {
    isLoading.value = true
    try {
      if (credentials.username === 'admin' && credentials.password === '123456') {
        const mockResponse: AuthResponse = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'refresh_token_123',
          user: {
            id: 1,
            username: credentials.username,
            email: 'admin@example.com',
            roles: ['ROLE_USER', 'ROLE_ADMIN']
          },
          expiresIn: 3600
        }
        setAuthData(mockResponse)
      } else {
        throw new Error('用户名或密码错误')
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
      if (registerData.verificationCode === '123456') {
        console.log('注册成功')
      } else {
        throw new Error('验证码错误')
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
      if (forgotData.verificationCode === '123456') {
        console.log('密码重置成功')
      } else {
        throw new Error('验证码错误')
      }
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const sendVerificationCode = async (email: string, type: 'register' | 'forgot'): Promise<void> => {
    console.log(`验证码已发送到 ${email}，类型: ${type}`)
  }
  
  const logout = async (): Promise<void> => {
    clearAuthData()
  }
  
  const setAuthData = (authData: AuthResponse) => {
    token.value = authData.token
    refreshToken.value = authData.refreshToken
    user.value = authData.user
    
    localStorage.setItem('access_token', authData.token)
    localStorage.setItem('refresh_token', authData.refreshToken)
    localStorage.setItem('user_info', JSON.stringify(authData.user))
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
