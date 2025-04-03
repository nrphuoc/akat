import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MetricData, AggregatedMetric, MetricConfig } from '../types/index.ts'
import { getConfig } from '../config/index.ts'

const supabase = createClient(
  getConfig().supabase_url,
  getConfig().supabase_key
)

export class MetricsService {
  async recordMetric(data: Omit<MetricData, 'id' | 'created_at'>): Promise<MetricData> {
    const { data: metric, error } = await supabase
      .from('metrics')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return metric
  }

  async aggregateMetrics(
    entityId: string,
    entityType: string,
    metricType: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<AggregatedMetric> {
    const { data, error } = await supabase.rpc(
      `aggregate_metrics_${period}`,
      {
        p_entity_id: entityId,
        p_entity_type: entityType,
        p_metric_type: metricType
      }
    )

    if (error) throw error
    return data
  }

  async getMetrics(
    entityId: string,
    entityType: string,
    metricType: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate: string,
    endDate: string
  ): Promise<AggregatedMetric[]> {
    const { data, error } = await supabase
      .from(`metrics_${period}`)
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .eq('metric_type', metricType)
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true })

    if (error) throw error
    return data
  }

  async cleanupOldMetrics(config: MetricConfig): Promise<void> {
    const { error } = await supabase.rpc('cleanup_old_metrics', {
      p_entity_type: config.entity_type,
      p_retention_days: config.retention_days
    })

    if (error) throw error
  }
} 