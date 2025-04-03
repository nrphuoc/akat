import { SchedulerConfig } from '../types/index.ts'

export function getSchedulerConfig(): SchedulerConfig {
  return {
    supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
    supabase_key: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    max_concurrent_tasks: parseInt(Deno.env.get('MAX_CONCURRENT_TASKS') ?? '5'),
    task_timeout: parseInt(Deno.env.get('TASK_TIMEOUT') ?? '30000'),
    retry_count: parseInt(Deno.env.get('RETRY_COUNT') ?? '3'),
    retry_delay: parseInt(Deno.env.get('RETRY_DELAY') ?? '1000')
  }
}

export const DEFAULT_TASK_CONFIG = {
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const CRON_PATTERNS = {
  EVERY_MINUTE: '* * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_DAY: '0 0 * * *',
  EVERY_WEEK: '0 0 * * 0',
  EVERY_MONTH: '0 0 1 * *'
}

export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const 