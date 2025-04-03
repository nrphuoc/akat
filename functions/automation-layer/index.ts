import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AutomationEvent, AutomationResponse } from './src/types/index.ts'
import { RuleEngine } from './src/services/ruleEngine.ts'
import { ActionExecutor } from './src/services/actionExecutor.ts'

const ruleEngine = new RuleEngine()
const actionExecutor = new ActionExecutor()

async function handleRequest(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const event: AutomationEvent = await req.json()
    const startTime = Date.now()

    // Validate event type
    if (!['database_change', 'schedule', 'webhook'].includes(event.type)) {
      throw new Error('Invalid event type')
    }

    // Get matching rules
    const matchingRules = await ruleEngine.getMatchingRules(event)
    
    // Execute actions for each matching rule
    const results: AutomationResponse[] = []
    
    for (const rule of matchingRules) {
      const executedActions = await actionExecutor.executeActions(rule.actions, event)
      
      results.push({
        success: true,
        data: {
          rule_id: rule.id,
          executed_actions,
          execution_time: Date.now() - startTime
        }
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          results,
          total_rules: matchingRules.length,
          total_execution_time: Date.now() - startTime
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in automation layer:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
          details: error
        }
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handleRequest) 