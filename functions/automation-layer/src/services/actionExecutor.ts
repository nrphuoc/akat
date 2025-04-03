import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Action, AutomationEvent } from '../types/index.ts'
import { getAutomationConfig, WEBHOOK_TIMEOUT, MAX_CONCURRENT_ACTIONS } from '../config/automation.ts'

export class ActionExecutor {
  private supabase
  private config

  constructor() {
    this.config = getAutomationConfig()
    this.supabase = createClient(this.config.supabase_url, this.config.supabase_key)
  }

  async executeActions(actions: Action[], event: AutomationEvent): Promise<string[]> {
    const executedActions: string[] = []
    const chunks = this.chunkArray(actions, MAX_CONCURRENT_ACTIONS)

    for (const chunk of chunks) {
      const results = await Promise.all(
        chunk.map(action => this.executeAction(action, event))
      )
      executedActions.push(...results.filter(Boolean))
    }

    return executedActions
  }

  private async executeAction(action: Action, event: AutomationEvent): Promise<string | null> {
    try {
      switch (action.type) {
        case 'update':
          await this.executeUpdateAction(action, event)
          break
        case 'create':
          await this.executeCreateAction(action, event)
          break
        case 'delete':
          await this.executeDeleteAction(action, event)
          break
        case 'notify':
          await this.executeNotifyAction(action, event)
          break
        case 'webhook':
          await this.executeWebhookAction(action, event)
          break
      }
      return `${action.type}:${action.target}`
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:${action.target}:`, error)
      return null
    }
  }

  private async executeUpdateAction(action: Action, event: AutomationEvent) {
    const { error } = await this.supabase
      .from(action.target)
      .update(action.params)
      .eq('id', event.data.record?.id)

    if (error) throw error
  }

  private async executeCreateAction(action: Action, event: AutomationEvent) {
    const { error } = await this.supabase
      .from(action.target)
      .insert(action.params)

    if (error) throw error
  }

  private async executeDeleteAction(action: Action, event: AutomationEvent) {
    const { error } = await this.supabase
      .from(action.target)
      .delete()
      .eq('id', event.data.record?.id)

    if (error) throw error
  }

  private async executeNotifyAction(action: Action, event: AutomationEvent) {
    // Implement notification logic (email, SMS, etc.)
    console.log('Notification:', action.params)
  }

  private async executeWebhookAction(action: Action, event: AutomationEvent) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT)

    try {
      const response = await fetch(action.params.url, {
        method: action.params.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...action.params.headers
        },
        body: JSON.stringify({
          event,
          action,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`)
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
} 