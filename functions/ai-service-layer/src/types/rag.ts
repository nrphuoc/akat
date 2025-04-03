export interface RagConfig {
  openaiKey: string
  supabaseUrl: string
  supabaseKey: string
}

// Page Context
export interface PageContext {
  id: string
  name: string
  style: {
    tone: string
    language: string
    common_phrases: string[]
  }
  topics: {
    name: string
    frequency: number
    engagement_rate: number
  }[]
  post_types: {
    type: string
    count: number
    avg_engagement: number
  }[]
}

// Product Info
export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  attributes: Record<string, any>
  metadata: {
    in_stock: boolean
    rating: number
    sales_count: number
  }
}

// Post Types
export interface PostContent {
  id: string
  page_id: string
  content: string
  type: string
  topic: string
  engagement_metrics: {
    likes: number
    comments: number
    shares: number
  }
  metadata: {
    products?: string[]
    media?: {
      type: string
      urls: string[]
    }
    hashtags?: string[]
  }
  embedding: number[]
} 