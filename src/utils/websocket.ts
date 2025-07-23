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

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.connectionStatus.value = 'connecting'
    
    try {
      const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = import.meta.env.PROD 
        ? window.location.host 
        : 'localhost:8002'
      
      const wsUrl = `${wsProtocol}//${wsHost}/ws`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket连接已建立')
        this.connectionStatus.value = 'connected'
        this.reconnectAttempts = 0
        this.lastError.value = null
        
        // 如果有token，发送认证消息
        if (token) {
          this.send('auth', { token })
        }
        
        // 开始心跳
        this.startHeartbeat()
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }
      
      this.ws.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason)
        this.connectionStatus.value = 'disconnected'
        this.stopHeartbeat()
        
        // 如果不是主动关闭，尝试重连
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        this.connectionStatus.value = 'error'
        this.lastError.value = 'WebSocket连接错误'
      }
      
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      this.connectionStatus.value = 'error'
      this.lastError.value = '无法创建WebSocket连接'
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