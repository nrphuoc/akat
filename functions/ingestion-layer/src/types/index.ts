export interface RequestBody {
  data: {
    page_id: string
    page_name: string
    page_category: string
    follower_count: number
    page_avatar_url?: string
    metrics?: {
      likes: number
      engagement: number
      reach: number
      response_rate: number
      posts: number
    }
  }
}

export interface PageDetails {
  page_id: string
  page_name: string
  page_category: string
  follower_count: number
  page_avatar_url?: string
  updated_at: string
}

export interface PageMetrics {
  page_id: string
  likes: number
  engagement: number
  reach: number
  response_rate: number
  posts: number
  updated_at: string
}

export interface ConnectionStatus {
  page_id: string
  status: 'connected' | 'disconnected'
  last_sync: string
} 