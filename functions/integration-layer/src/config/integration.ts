import { IntegrationConfig } from '../types/index.ts'

export function getIntegrationConfig(): IntegrationConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  const maxRetries = parseInt(Deno.env.get('INTEGRATION_MAX_RETRIES') || '3')
  const retryDelay = parseInt(Deno.env.get('INTEGRATION_RETRY_DELAY') || '1000')
  const timeout = parseInt(Deno.env.get('INTEGRATION_TIMEOUT') || '30000')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !webhookSecret) {
    throw new Error('Missing required configuration')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    webhookSecret,
    maxRetries,
    retryDelay,
    timeout
  }
}

export const INTEGRATION_PROVIDERS = {
  GITHUB: 'github',
  SLACK: 'slack',
  JIRA: 'jira',
  TRELLO: 'trello',
  ZOOM: 'zoom',
  STRIPE: 'stripe'
}

export const INTEGRATION_EVENTS = {
  WEBHOOK: 'webhook',
  API: 'api',
  OAUTH: 'oauth'
}

export const INTEGRATION_ERRORS = {
  CONNECTION: 'INTEGRATION_CONNECTION_ERROR',
  TIMEOUT: 'INTEGRATION_TIMEOUT_ERROR',
  VALIDATION: 'INTEGRATION_VALIDATION_ERROR',
  WEBHOOK: 'INTEGRATION_WEBHOOK_ERROR',
  OAUTH: 'INTEGRATION_OAUTH_ERROR'
}

export const INTEGRATION_MESSAGES = {
  SUCCESS: 'Integration success',
  ERROR: 'Integration error',
  WEBHOOK: 'Webhook received',
  OAUTH: 'OAuth flow completed'
}

export const INTEGRATION_ENDPOINTS = {
  WEBHOOK: '/webhook',
  OAUTH: '/oauth',
  CALLBACK: '/callback',
  STATUS: '/status'
}

export const INTEGRATION_HEADERS = {
  WEBHOOK_SIGNATURE: 'X-Webhook-Signature',
  PROVIDER: 'X-Provider',
  EVENT_TYPE: 'X-Event-Type',
  REQUEST_ID: 'X-Request-ID'
}

export const INTEGRATION_TIMEOUTS = {
  SHORT: 5000, // 5 seconds
  MEDIUM: 15000, // 15 seconds
  LONG: 30000 // 30 seconds
}

export const INTEGRATION_RETRIES = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3
} 