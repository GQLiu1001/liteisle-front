import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '@/utils/api'
import { connectWebSocket, disconnectWebSocket } from '@/utils/websocket'
import { useToast } from 'vue-toastification'
import type { 
  AuthLoginReq, 
  AuthRegisterReq, 
  AuthForgotPasswordReq, 
  AuthResetPasswordReq,
  AuthCurrentUserResp 
} from '@/types/api'

export const useAuthStoreV5 = defineStore('authV5', () => {
  const toast = useToast()
  
  // 响应式状态
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const user = ref<AuthCurrentUserResp | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const storageUsagePercentage = computed(() => {
    if (!user.value || user.value.storage_quota === 0) return 0
    return Math.round((user.value.storage_used / user.value.storage_quota) * 100)
  })
  
  /**
   * 用户登录
   */
  const login = async (credentials: AuthLoginReq): Promise<boolean> => {
    try {
      isLoading.value = true
      const response = await API.auth.login(credentials)
      
      if (response.data) {
        // 保存token
        token.value = response.data.token
        localStorage.setItem('access_token', response.data.token)
        
        // 获取用户详细信息
        await getCurrentUser()
        
        // 连接WebSocket
        connectWebSocket(response.data.token)
        
        toast.success('登录成功')
        return true
      }
      
      return false
    } catch (error) {
      console.error('登录失败:', error)
      toast.error('登录失败，请检查用户名和密码')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 用户注册
   */
  const register = async (registerData: AuthRegisterReq): Promise<boolean> => {
    try {
      isLoading.value = true
      const response = await API.auth.register(registerData)
      
      if (response.data) {
        // 保存token
        token.value = response.data.token
        localStorage.setItem('access_token', response.data.token)
        
        // 获取用户详细信息
        await getCurrentUser()
        
        // 连接WebSocket
        connectWebSocket(response.data.token)
        
        toast.success('注册成功')
        return true
      }
      
      return false
    } catch (error) {
      console.error('注册失败:', error)
      toast.error('注册失败，请检查信息是否正确')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 发送验证码
   */
  const sendVerificationCode = async (email: string): Promise<boolean> => {
    try {
      isLoading.value = true
      await API.auth.sendVcode(email)
      toast.success('验证码已发送，请注意查收')
      return true
    } catch (error) {
      console.error('发送验证码失败:', error)
      toast.error('发送验证码失败')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 忘记密码
   */
  const forgotPassword = async (data: AuthForgotPasswordReq): Promise<boolean> => {
    try {
      isLoading.value = true
      await API.auth.forgotPassword(data)
      toast.success('密码重置成功')
      return true
    } catch (error) {
      console.error('密码重置失败:', error)
      toast.error('密码重置失败')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 获取当前用户信息
   */
  const getCurrentUser = async (): Promise<void> => {
    try {
      const response = await API.auth.getCurrentUser()
      if (response.data) {
        user.value = response.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，可能token已过期，执行退出登录
      await logout()
    }
  }
  
  /**
   * 修改密码
   */
  const resetPassword = async (data: AuthResetPasswordReq): Promise<boolean> => {
    try {
      isLoading.value = true
      await API.auth.resetPassword(data)
      toast.success('密码修改成功')
      return true
    } catch (error) {
      console.error('密码修改失败:', error)
      toast.error('密码修改失败')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 上传头像
   */
  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      isLoading.value = true
      const response = await API.auth.uploadAvatar(file)
      
      if (response.data && user.value) {
        user.value.avatar = response.data
        toast.success('头像上传成功')
        return true
      }
      
      return false
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error('头像上传失败')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 重置头像
   */
  const resetAvatar = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      const response = await API.auth.resetAvatar()
      
      if (response.data && user.value) {
        user.value.avatar = response.data
        toast.success('头像已重置')
        return true
      }
      
      return false
    } catch (error) {
      console.error('重置头像失败:', error)
      toast.error('重置头像失败')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 退出登录
   */
  const logout = async (): Promise<void> => {
    try {
      // 先调用后端退出登录API
      if (token.value) {
        await API.auth.logout()
      }
    } catch (error) {
      console.warn('后端退出登录失败:', error)
    }
    
    // 清理本地状态
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    
    // 断开WebSocket连接
    disconnectWebSocket()
    
    toast.info('已退出登录')
  }
  
  /**
   * 初始化认证状态
   */
  const initializeAuth = async (): Promise<void> => {
    if (isInitialized.value) return
    
    try {
      const savedToken = localStorage.getItem('access_token')
      if (savedToken) {
        token.value = savedToken
        await getCurrentUser()
        
        // 连接WebSocket
        connectWebSocket(savedToken)
      }
    } catch (error) {
      console.warn('初始化认证状态失败:', error)
      await logout()
    } finally {
      isInitialized.value = true
    }
  }
  
  /**
   * 格式化存储空间
   */
  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  /**
   * 获取存储空间信息
   */
  const getStorageInfo = computed(() => {
    if (!user.value) {
      return {
        used: '0 B',
        quota: '0 B',
        usedBytes: 0,
        quotaBytes: 0,
        percentage: 0
      }
    }
    
    return {
      used: formatStorageSize(user.value.storage_used),
      quota: formatStorageSize(user.value.storage_quota),
      usedBytes: user.value.storage_used,
      quotaBytes: user.value.storage_quota,
      percentage: storageUsagePercentage.value
    }
  })
  
  return {
    // 状态
    token,
    user,
    isLoading,
    isInitialized,
    
    // 计算属性
    isAuthenticated,
    storageUsagePercentage,
    getStorageInfo,
    
    // 方法
    login,
    register,
    sendVerificationCode,
    forgotPassword,
    getCurrentUser,
    resetPassword,
    uploadAvatar,
    resetAvatar,
    logout,
    initializeAuth,
    formatStorageSize
  }
}) 