import { NotificationConfig } from '../types/index.ts'

export function getNotificationConfig(): NotificationConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')
  const maxRetries = parseInt(Deno.env.get('NOTIFICATION_MAX_RETRIES') || '3')
  const retryDelay = parseInt(Deno.env.get('NOTIFICATION_RETRY_DELAY') || '1000')
  const timeout = parseInt(Deno.env.get('NOTIFICATION_TIMEOUT') || '30000')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing required configuration')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    maxRetries,
    retryDelay,
    timeout
  }
}

export const NOTIFICATION_PROVIDERS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  CHAT: 'chat'
}

export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WEBHOOK: 'webhook'
}

export const NOTIFICATION_ERRORS = {
  CONNECTION: 'NOTIFICATION_CONNECTION_ERROR',
  TIMEOUT: 'NOTIFICATION_TIMEOUT_ERROR',
  VALIDATION: 'NOTIFICATION_VALIDATION_ERROR',
  TEMPLATE: 'NOTIFICATION_TEMPLATE_ERROR',
  PROVIDER: 'NOTIFICATION_PROVIDER_ERROR'
}

export const NOTIFICATION_MESSAGES = {
  SUCCESS: 'Notification sent successfully',
  ERROR: 'Failed to send notification',
  TEMPLATE: 'Template not found',
  PROVIDER: 'Provider not found'
}

export const NOTIFICATION_ENDPOINTS = {
  SEND: '/send',
  TEMPLATES: '/templates',
  WEBHOOK: '/webhook',
  STATUS: '/status'
}

export const NOTIFICATION_HEADERS = {
  PROVIDER: 'X-Provider',
  TYPE: 'X-Type',
  TEMPLATE: 'X-Template',
  REQUEST_ID: 'X-Request-ID'
}

export const NOTIFICATION_TIMEOUTS = {
  SHORT: 5000, // 5 seconds
  MEDIUM: 15000, // 15 seconds
  LONG: 30000 // 30 seconds
}

export const NOTIFICATION_RETRIES = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3
}

export const NOTIFICATION_PRIORITIES = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
}

export const NOTIFICATION_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
  READ: 'read'
} 