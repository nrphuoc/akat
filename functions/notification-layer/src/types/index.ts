export interface NotificationConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  maxRetries: number
  retryDelay: number
  timeout: number
}

export interface NotificationOptions {
  retry?: boolean
  timeout?: number
  priority?: 'high' | 'normal' | 'low'
  scheduledAt?: Date
  template?: string
  data?: Record<string, any>
}

export interface NotificationResponse {
  success: boolean
  messageId?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface NotificationError extends Error {
  code: string
  status: number
  details?: any
}

export interface NotificationProvider {
  name: string
  type: 'email' | 'sms' | 'push' | 'chat'
  config: {
    apiKey?: string
    apiSecret?: string
    sender?: string
    webhookUrl?: string
  }
  capabilities: {
    send: boolean
    receive: boolean
    templates: boolean
  }
}

export interface NotificationTemplate {
  id: string
  name: string
  provider: string
  type: string
  content: string
  variables: string[]
  created_at: Date
  updated_at: Date
}

export interface NotificationMessage {
  id: string
  provider: string
  type: string
  recipient: string
  subject?: string
  content: string
  template?: string
  data?: Record<string, any>
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read'
  error?: string
  created_at: Date
  updated_at: Date
}

export interface NotificationLogger {
  log(message: NotificationMessage): void
  error(error: Error): void
  warn(message: string): void
  info(message: string): void
  debug(message: string): void
}

export interface NotificationMetrics {
  recordSuccess(provider: string, type: string): void
  recordError(provider: string, type: string, error: Error): void
  getStats(): NotificationStats
  reset(): void
}

export interface NotificationStats {
  successes: {
    [key: string]: {
      [key: string]: number
    }
  }
  errors: {
    [key: string]: {
      [key: string]: number
    }
  }
  totalMessages: number
  averageDeliveryTime: number
}

export interface NotificationValidator {
  isValid(data: any): boolean
  validate(data: any): void
}

export interface NotificationTransformer {
  transform(data: any): any
  reverseTransform(data: any): any
}

export interface NotificationCache {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
} 