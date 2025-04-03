import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { MetricsService } from './src/services/metrics.ts'
import { MetricData, AggregatedMetric } from './src/types/index.ts'

const metricsService = new MetricsService()

async function handleRequest(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { action, data } = await req.json()

    switch (action) {
      case 'record':
        const metric = await metricsService.recordMetric(data as Omit<MetricData, 'id' | 'created_at'>)
        return new Response(
          JSON.stringify({ success: true, data: metric }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'aggregate':
        const aggregated = await metricsService.aggregateMetrics(
          data.entity_id,
          data.entity_type,
          data.metric_type,
          data.period
        )
        return new Response(
          JSON.stringify({ success: true, data: aggregated }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'query':
        const metrics = await metricsService.getMetrics(
          data.entity_id,
          data.entity_type,
          data.metric_type,
          data.period,
          data.start_date,
          data.end_date
        )
        return new Response(
          JSON.stringify({ success: true, data: metrics }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handleRequest) 