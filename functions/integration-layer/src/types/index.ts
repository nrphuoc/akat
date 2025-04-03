export interface IntegrationConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  webhookSecret: string
  maxRetries: number
  retryDelay: number
  timeout: number
}

export interface IntegrationOptions {
  retry?: boolean
  timeout?: number
  headers?: Record<string, string>
  validateWebhook?: boolean
}

export interface IntegrationResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface IntegrationError extends Error {
  code: string
  status: number
  details?: any
}

export interface IntegrationProvider {
  name: string
  type: 'webhook' | 'api' | 'oauth'
  config: {
    url?: string
    token?: string
    clientId?: string
    clientSecret?: string
    webhookSecret?: string
  }
  endpoints: {
    [key: string]: {
      url: string
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      headers?: Record<string, string>
      body?: Record<string, any>
    }
  }
}

export interface IntegrationEvent {
  type: string
  provider: string
  data: any
  timestamp: number
  metadata?: {
    userId?: string
    sessionId?: string
    requestId?: string
  }
}

export interface IntegrationLogger {
  log(event: IntegrationEvent): void
  error(error: Error): void
  warn(message: string): void
  info(message: string): void
  debug(message: string): void
}

export interface IntegrationMetrics {
  recordSuccess(provider: string, type: string): void
  recordError(provider: string, type: string, error: Error): void
  getStats(): IntegrationStats
  reset(): void
}

export interface IntegrationStats {
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
  totalRequests: number
  averageResponseTime: number
}

export interface IntegrationValidator {
  isValid(data: any): boolean
  validate(data: any): void
}

export interface IntegrationTransformer {
  transform(data: any): any
  reverseTransform(data: any): any
}

export interface IntegrationCache {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
} 