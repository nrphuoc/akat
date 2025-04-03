import { FacebookConfig } from '../types/facebook'

export class FacebookService {
  private accessToken: string
  private apiVersion: string = 'v18.0'
  private baseUrl: string = 'https://graph.facebook.com'

  constructor(config: FacebookConfig) {
    this.accessToken = config.accessToken
  }

  // Đăng bài viết mới
  async createPost(pageId: string, content: {
    message: string
    images?: string[]
    videos?: string[]
  }) {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${pageId}/feed`
      
      const formData = new FormData()
      formData.append('message', content.message)
      
      // Thêm hình ảnh nếu có
      if (content.images?.length) {
        content.images.forEach(image => {
          formData.append('attached_media[]', JSON.stringify({
            media_fbid: image
          }))
        })
      }

      // Thêm video nếu có
      if (content.videos?.length) {
        content.videos.forEach(video => {
          formData.append('attached_media[]', JSON.stringify({
            media_fbid: video
          }))
        })
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating Facebook post:', error)
      throw error
    }
  }

  // Cập nhật bài viết
  async updatePost(postId: string, content: {
    message?: string
    is_hidden?: boolean
  }) {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${postId}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating Facebook post:', error)
      throw error
    }
  }

  // Xóa bài viết
  async deletePost(postId: string) {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${postId}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting Facebook post:', error)
      throw error
    }
  }

  // Ẩn/hiện bài viết
  async togglePostVisibility(postId: string, isHidden: boolean) {
    return this.updatePost(postId, { is_hidden: isHidden })
  }

  // Upload media trước khi đăng bài
  async uploadMedia(pageId: string, mediaUrl: string, type: 'image' | 'video') {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${pageId}/${type === 'image' ? 'photos' : 'videos'}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: mediaUrl,
          published: false
        })
      })

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading media to Facebook:', error)
      throw error
    }
  }
} 