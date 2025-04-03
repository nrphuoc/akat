import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AutomationRule, RuleCondition, AutomationEvent } from '../types/index.ts'
import { getAutomationConfig } from '../config/automation.ts'

export class RuleEngine {
  private supabase

  constructor() {
    const config = getAutomationConfig()
    this.supabase = createClient(config.supabase_url, config.supabase_key)
  }

  async evaluateCondition(condition: RuleCondition, event: AutomationEvent): Promise<boolean> {
    const results = await Promise.all(
      condition.conditions.map(async (c) => {
        const value = this.extractValue(event, c.field)
        return this.compareValues(value, c.value, c.operator)
      })
    )

    return condition.type === 'and' 
      ? results.every(r => r)
      : results.some(r => r)
  }

  private extractValue(event: AutomationEvent, field: string): any {
    if (!event.data.record) return null
    
    const parts = field.split('.')
    let value = event.data.record
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part]
      } else {
        return null
      }
    }
    
    return value
  }

  private compareValues(a: any, b: any, operator: string): boolean {
    switch (operator) {
      case 'eq': return a === b
      case 'neq': return a !== b
      case 'gt': return a > b
      case 'lt': return a < b
      case 'gte': return a >= b
      case 'lte': return a <= b
      case 'contains': return String(a).includes(String(b))
      case 'not_contains': return !String(a).includes(String(b))
      default: return false
    }
  }

  async getMatchingRules(event: AutomationEvent): Promise<AutomationRule[]> {
    const { data: rules, error } = await this.supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    const matchingRules = await Promise.all(
      rules.map(async (rule: AutomationRule) => {
        const matches = await this.evaluateCondition(rule.condition, event)
        return matches ? rule : null
      })
    )

    return matchingRules.filter((rule): rule is AutomationRule => rule !== null)
  }
} 