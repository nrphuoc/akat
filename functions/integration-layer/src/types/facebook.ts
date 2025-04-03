export interface FacebookConfig {
  accessToken: string
  apiVersion?: string
}

export interface FacebookPost {
  id: string
  message: string
  created_time: string
  is_hidden?: boolean
  attachments?: {
    media: {
      image?: {
        src: string
      }
      video?: {
        src: string
      }
    }[]
  }
}

export interface FacebookResponse {
  success: boolean
  data?: any
  error?: {
    message: string
    type: string
    code: number
  }
} 