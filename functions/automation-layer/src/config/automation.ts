import { AutomationConfig } from '../types/index.ts'

export function getAutomationConfig(): AutomationConfig {
  return {
    supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
    supabase_key: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    webhook_secret: Deno.env.get('WEBHOOK_SECRET') ?? '',
    max_retries: parseInt(Deno.env.get('MAX_RETRIES') ?? '3'),
    retry_delay: parseInt(Deno.env.get('RETRY_DELAY') ?? '1000')
  }
}

export const DEFAULT_RULE_CONFIG = {
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const WEBHOOK_TIMEOUT = 5000 // 5 seconds
export const MAX_CONCURRENT_ACTIONS = 5 