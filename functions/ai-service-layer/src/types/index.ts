export interface AIRequest {
  type: 'analyze' | 'generate' | 'search' | 'recommend'
  data: {
    content?: string
    query?: string
    context?: Record<string, any>
    options?: {
      model?: string
      temperature?: number
      max_tokens?: number
      top_p?: number
    }
  }
}

export interface AIResponse {
  success: boolean
  data?: {
    result: string | any
    metadata?: {
      model: string
      tokens: number
      processing_time: number
    }
  }
  error?: {
    message: string
    code: string
    details?: any
  }
}

export interface VectorSearchResult {
  id: string
  content: string
  metadata: Record<string, any>
  similarity: number
}

export interface AIAgentConfig {
  name: string
  description: string
  capabilities: string[]
  model: string
  temperature: number
  max_tokens: number
}

export interface AIServiceConfig {
  openai_api_key: string
  supabase_url: string
  supabase_key: string
  langchain_api_key: string
  vector_store_name: string
} 