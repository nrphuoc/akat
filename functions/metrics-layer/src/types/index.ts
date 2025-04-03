export interface MetricData {
  id: string
  entity_id: string
  entity_type: string
  metric_type: string
  value: number
  timestamp: string
  metadata?: Record<string, any>
  created_at: string
}

export interface AggregatedMetric {
  entity_id: string
  entity_type: string
  metric_type: string
  period: 'daily' | 'weekly' | 'monthly'
  start_date: string
  avg_value: number
  max_value: number
  min_value: number
  total_value: number
  count: number
}

export interface MetricConfig {
  entity_type: string
  metric_types: string[]
  aggregation_periods: ('daily' | 'weekly' | 'monthly')[]
  retention_days: number
} 