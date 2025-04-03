import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { NotificationConfig, NotificationMessage, NotificationResponse, NotificationError } from '../types/index.ts'
import { getNotificationConfig, NOTIFICATION_ERRORS, NOTIFICATION_MESSAGES } from '../config/notification.ts'
import { EmailProvider } from '../providers/email.ts'
import { ChatProvider } from '../providers/chat.ts'

export class NotificationService {
  private supabase
  private config: NotificationConfig
  private emailProvider: EmailProvider
  private chatProvider: ChatProvider

  constructor() {
    this.config = getNotificationConfig()
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    )
    this.emailProvider = new EmailProvider()
    this.chatProvider = new ChatProvider()
  }

  async send(message: NotificationMessage): Promise<NotificationResponse> {
    try {
      // Validate message
      if (!message.provider || !message.type || !message.recipient || !message.content) {
        throw new Error('Missing required fields')
      }

      // Get provider based on type
      let result: NotificationResponse
      switch (message.type) {
        case 'email':
          result = await this.emailProvider.send(message)
          break
        case 'chat':
          result = await this.chatProvider.send(message)
          break
        default:
          throw new Error(`Unsupported notification type: ${message.type}`)
      }

      return result
    } catch (error) {
      const notificationError = error as NotificationError
      notificationError.code = NOTIFICATION_ERRORS.PROVIDER
      throw notificationError
    }
  }

  async receive(payload: any): Promise<void> {
    try {
      // Get provider from payload
      const provider = payload.provider
      if (!provider) {
        throw new Error('Missing provider in payload')
      }

      // Handle based on provider
      switch (provider) {
        case 'email':
          await this.emailProvider.receive(payload)
          break
        case 'zalo':
        case 'lark':
        case 'slack':
          await this.chatProvider.receive(payload)
          break
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }
    } catch (error) {
      console.error('Error receiving notification:', error)
      throw error
    }
  }

  async getTemplates(provider: string, type: string): Promise<any[]> {
    try {
      const { data: templates, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('provider', provider)
        .eq('type', type)

      if (error) {
        throw error
      }

      return templates
    } catch (error) {
      console.error('Error getting templates:', error)
      throw error
    }
  }

  async getMessages(
    provider?: string,
    type?: string,
    status?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any[]> {
    try {
      let query = this.supabase
        .from('notification_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (provider) {
        query = query.eq('provider', provider)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data: messages, error } = await query

      if (error) {
        throw error
      }

      return messages
    } catch (error) {
      console.error('Error getting messages:', error)
      throw error
    }
  }

  async updateMessageStatus(
    messageId: string,
    status: string,
    error?: string
  ): Promise<void> {
    try {
      const { error: updateError } = await this.supabase
        .from('notification_messages')
        .update({
          status,
          error,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (updateError) {
        throw updateError
      }
    } catch (error) {
      console.error('Error updating message status:', error)
      throw error
    }
  }
} 