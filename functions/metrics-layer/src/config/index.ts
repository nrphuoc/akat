export function getConfig() {
  return {
    supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
    supabase_key: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    metrics_retention_days: parseInt(Deno.env.get('METRICS_RETENTION_DAYS') ?? '90'),
    max_aggregation_batch_size: parseInt(Deno.env.get('MAX_AGGREGATION_BATCH_SIZE') ?? '1000')
  }
} 