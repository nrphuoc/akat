export interface AutomationRule {
  id: string
  name: string
  description: string
  condition: RuleCondition
  actions: Action[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RuleCondition {
  type: 'and' | 'or'
  conditions: {
    field: string
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not_contains'
    value: any
  }[]
}

export interface Action {
  type: 'update' | 'create' | 'delete' | 'notify' | 'webhook'
  target: string
  params: Record<string, any>
}

export interface AutomationEvent {
  type: 'database_change' | 'schedule' | 'webhook'
  data: {
    table?: string
    operation?: 'insert' | 'update' | 'delete'
    record?: Record<string, any>
    schedule?: {
      cron: string
      timezone: string
    }
    webhook?: {
      url: string
      method: string
      headers?: Record<string, string>
      body?: any
    }
  }
}

export interface AutomationResponse {
  success: boolean
  data?: {
    rule_id: string
    executed_actions: string[]
    execution_time: number
  }
  error?: {
    message: string
    code: string
    details?: any
  }
}

export interface AutomationConfig {
  supabase_url: string
  supabase_key: string
  webhook_secret: string
  max_retries: number
  retry_delay: number
} 