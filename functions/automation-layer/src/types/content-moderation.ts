// Interface cho request gửi vào
export interface ContentModerationRequest {
  content: {
    text: string
    type: 'post' | 'comment'
    media?: {
      images?: string[]
      videos?: string[]
    }
    post_id: string
  }
  moderation_settings: {
    auto_actions: {
      hide_post: boolean
      auto_fix: boolean
    }
    violation_thresholds: {
      confidence_threshold: number
    }
  }
}

// Interface cho kết quả phân tích nội dung
export interface ContentAnalysis {
  violates: boolean
  confidence: number
  violation_type: string
  reason: string
  severity: 'veryhigh' | 'high' | 'medium' | 'low'
}

// Interface cho hành động thực hiện
export interface ActionTaken {
  action_taken: 'delete' | 'fix' | 'none'
  recommendation: string
  fixed_content?: string
  reason: string
}

// Interface cho thông tin model AI sử dụng
export interface ModelInfo {
  model: string
  platform: string
  ai_agent_name: string
}

// Interface cho response trả về
export interface ContentModerationResponse {
  analysis: ContentAnalysis
  actions: ActionTaken
  model_info: ModelInfo
} 