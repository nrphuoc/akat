import { AIServiceConfig } from '../types/index.ts'

export function getAIServiceConfig(): AIServiceConfig {
  return {
    openai_api_key: Deno.env.get('OPENAI_API_KEY') ?? '',
    supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
    supabase_key: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    langchain_api_key: Deno.env.get('LANGCHAIN_API_KEY') ?? '',
    vector_store_name: Deno.env.get('VECTOR_STORE_NAME') ?? 'default'
  }
}

export const DEFAULT_MODEL_CONFIG = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  max_tokens: 5000,
  top_p: 0.9
}

export const VECTOR_SEARCH_CONFIG = {
  similarity_threshold: 0.7,
  max_results: 5
} 