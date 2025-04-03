import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { VectorSearchResult } from '../types/index.ts'
import { getAIServiceConfig, VECTOR_SEARCH_CONFIG } from '../config/ai.ts'

export class VectorService {
  private supabase
  private vectorStoreName: string

  constructor() {
    const config = getAIServiceConfig()
    this.supabase = createClient(config.supabase_url, config.supabase_key)
    this.vectorStoreName = config.vector_store_name
  }

  async searchSimilar(query: string): Promise<VectorSearchResult[]> {
    const { data, error } = await this.supabase.rpc('match_documents', {
      query_text: query,
      match_threshold: VECTOR_SEARCH_CONFIG.similarity_threshold,
      match_count: VECTOR_SEARCH_CONFIG.max_results
    })

    if (error) throw error

    return data.map((item: any) => ({
      id: item.id,
      content: item.content,
      metadata: item.metadata,
      similarity: item.similarity
    }))
  }

  async upsertDocument(content: string, metadata: Record<string, any>) {
    const { error } = await this.supabase
      .from(this.vectorStoreName)
      .upsert({
        content,
        metadata,
        embedding: await this.generateEmbedding(content)
      })

    if (error) throw error
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAIServiceConfig().openai_api_key}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    })

    const data = await response.json()
    return data.data[0].embedding
  }
} 