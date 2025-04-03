export interface ScheduledTask {
  id: string
  name: string
  description: string
  schedule: {
    cron: string
    timezone: string
  }
  task: {
    type: 'database' | 'webhook' | 'function'
    config: {
      query?: string
      url?: string
      method?: string
      headers?: Record<string, string>
      body?: any
      function_name?: string
      params?: Record<string, any>
    }
  }
  is_active: boolean
  last_run?: string
  next_run?: string
  created_at: string
  updated_at: string
}

export interface TaskExecution {
  id: string
  task_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  error?: {
    message: string
    code: string
    details?: any
  }
  result?: any
}

export interface SchedulerConfig {
  supabase_url: string
  supabase_key: string
  max_concurrent_tasks: number
  task_timeout: number
  retry_count: number
  retry_delay: number
}

export interface CronExpression {
  minute: string
  hour: string
  day_of_month: string
  month: string
  day_of_week: string
}

export interface TaskResult {
  success: boolean
  data?: any
  error?: {
    message: string
    code: string
    details?: any
  }
  execution_time: number
  started_at: string
  completed_at: string
} 