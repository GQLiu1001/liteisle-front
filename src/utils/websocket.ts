import { ref, reactive } from 'vue'
import type { 
  WebSocketEvent, 
  FileStatusUpdatedEvent, 
  TransferLogUpdatedEvent, 
  NotificationEvent 
} from '@/types/api'

export type WebSocketEventType = 
  | 'file.status.updated'
  | 'transfer.log.updated'
  | 'notification.new'

export type WebSocketEventHandler<T = any> = (payload: T) => void

class WebSocketManager {
  private ws: WebSocket | null = null
  private eventHandlers = new Map<WebSocketEventType, Set<WebSocketEventHandler>>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  
  public connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  public lastError = ref<string | null>(null)

  constructor() {
    // 在页面卸载时关闭连接
    window.addEventListener('beforeunload', () => {
      this.disconnect()
    })
  }

  // 连接WebSocket
  connect(token?: string) {
    // 暂时禁用WebSocket连接
    console.log('🔌 WebSocket连接已禁用，只有在需要实时功能时才会连接')
    return
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket已连接')
      return
    }
    
    if (this.isConnecting) {
      console.log('🔌 WebSocket正在连接中...')
      return
    }
    
    this.isConnecting = true
    console.log('🔌 正在连接WebSocket...')
    
    try {
      // 确保WebSocket连接的URL正确
      const wsUrl = import.meta.env.PROD ? 'wss://your-production-url/ws' : 'ws://localhost:8002/ws'

      // 创建WebSocket连接
      const socket = new WebSocket(wsUrl)

      // 处理WebSocket错误
      socket.onerror = (event) => {
        console.error('WebSocket错误:', event)
        // 这里可以添加统一的错误提示
        alert('WebSocket连接失败，请检查服务器配置。')
      }

      // 处理WebSocket关闭
      socket.onclose = (event) => {
        console.warn('WebSocket连接已关闭:', event.code)
        // 这里可以添加重连逻辑
        setTimeout(() => {
          console.log('尝试重连...')
          connectWebSocket()
        }, 1000)
      }
      
      this.ws = socket
       
      this.ws.onopen = () => {
        console.log('🔌 WebSocket连接成功')
        this.isConnected = true
        this.isConnecting = false
        this.reconnectAttempts = 0
        
        // 发送认证信息
        if (token) {
          this.send('auth', { token })
        }
      }
       
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }
       
      this.ws.onerror = (event) => {
        console.error('WebSocket错误:', event)
        this.isConnecting = false
      }
       
      this.ws.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code)
        this.isConnected = false
        this.isConnecting = false
        this.ws = null
        
        // 只有在不是主动关闭的情况下才重连
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      this.isConnecting = false
    }
  }

  disconnect() {
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close(1000, '主动断开连接')
      this.ws = null
    }
    
    this.connectionStatus.value = 'disconnected'
  }

  private scheduleReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`${delay}ms后尝试第${this.reconnectAttempts}次重连...`)
    
    setTimeout(() => {
      if (this.connectionStatus.value !== 'connected') {
        // 重新获取token尝试连接
        const token = localStorage.getItem('access_token')
        this.connect(token || undefined)
      }
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {})
      }
    }, 30000) // 30秒心跳
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private send(event: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketEvent = { event, payload }
      this.ws.send(JSON.stringify(message))
    }
  }

  private handleMessage(message: WebSocketEvent) {
    const handlers = this.eventHandlers.get(message.event as WebSocketEventType)
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.payload)
        } catch (error) {
          console.error('WebSocket事件处理器错误:', error)
        }
      })
    }
  }

  // 订阅事件
  on<T = any>(event: WebSocketEventType, handler: WebSocketEventHandler<T>) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    
    this.eventHandlers.get(event)!.add(handler)
    
    // 返回取消订阅函数
    return () => {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.eventHandlers.delete(event)
        }
      }
    }
  }

  // 取消订阅事件
  off(event: WebSocketEventType, handler?: WebSocketEventHandler) {
    if (!handler) {
      // 如果没有指定处理器，移除该事件的所有处理器
      this.eventHandlers.delete(event)
    } else {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.eventHandlers.delete(event)
        }
      }
    }
  }

  // 一次性订阅
  once<T = any>(event: WebSocketEventType, handler: WebSocketEventHandler<T>) {
    const unsubscribe = this.on(event, (payload: T) => {
      handler(payload)
      unsubscribe()
    })
    
    return unsubscribe
  }
}

// 创建全局WebSocket实例
export const wsManager = new WebSocketManager()

// 便捷的订阅函数
export function onFileStatusUpdated(handler: WebSocketEventHandler<FileStatusUpdatedEvent>) {
  return wsManager.on('file.status.updated', handler)
}

export function onTransferLogUpdated(handler: WebSocketEventHandler<TransferLogUpdatedEvent>) {
  return wsManager.on('transfer.log.updated', handler)
}

export function onNotification(handler: WebSocketEventHandler<NotificationEvent>) {
  return wsManager.on('notification.new', handler)
}

// 连接和断开连接的便捷函数
export function connectWebSocket(token?: string) {
  wsManager.connect(token)
}

export function disconnectWebSocket() {
  wsManager.disconnect()
}

export default wsManager 