import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { NotificationConfig, NotificationMessage, NotificationResponse, NotificationError } from '../types/index.ts'
import { getNotificationConfig, NOTIFICATION_ERRORS, NOTIFICATION_MESSAGES } from '../config/notification.ts'

export class ChatProvider {
  private supabase
  private config: NotificationConfig

  constructor() {
    this.config = getNotificationConfig()
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    )
  }

  async send(message: NotificationMessage): Promise<NotificationResponse> {
    try {
      // Validate message
      if (!message.recipient || !message.content) {
        throw new Error('Missing required fields')
      }

      // Get template if specified
      let content = message.content
      if (message.template) {
        const { data: template, error: templateError } = await this.supabase
          .from('notification_templates')
          .select('*')
          .eq('id', message.template)
          .single()

        if (templateError || !template) {
          throw new Error(NOTIFICATION_MESSAGES.TEMPLATE)
        }

        // Replace variables in template
        content = this.replaceTemplateVariables(template.content, message.data || {})
      }

      // Send message based on provider
      let result
      switch (message.provider) {
        case 'zalo':
          result = await this.sendZaloMessage(message.recipient, content)
          break
        case 'lark':
          result = await this.sendLarkMessage(message.recipient, content)
          break
        case 'slack':
          result = await this.sendSlackMessage(message.recipient, content)
          break
        default:
          throw new Error(`Unsupported chat provider: ${message.provider}`)
      }

      // Store message
      await this.supabase.from('notification_messages').insert({
        id: result.id,
        provider: message.provider,
        type: 'chat',
        recipient: message.recipient,
        content,
        template: message.template,
        data: message.data,
        status: 'sent'
      })

      return {
        success: true,
        messageId: result.id
      }
    } catch (error) {
      const notificationError = error as NotificationError
      notificationError.code = NOTIFICATION_ERRORS.PROVIDER

      // Store failed message
      await this.supabase.from('notification_messages').insert({
        provider: message.provider,
        type: 'chat',
        recipient: message.recipient,
        content: message.content,
        template: message.template,
        data: message.data,
        status: 'failed',
        error: error.message
      })

      throw notificationError
    }
  }

  async receive(payload: any): Promise<void> {
    try {
      // Store received message
      await this.supabase.from('notification_messages').insert({
        provider: payload.provider,
        type: 'chat',
        recipient: payload.from,
        content: payload.text,
        status: 'received'
      })
    } catch (error) {
      console.error('Error receiving chat message:', error)
      throw error
    }
  }

  private async sendZaloMessage(recipient: string, content: string): Promise<{ id: string }> {
    const response = await fetch('https://graph.zalo.me/v2.0/me/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('ZALO_ACCESS_TOKEN')}`
      },
      body: JSON.stringify({
        recipient: { user_id: recipient },
        message: { text: content }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send Zalo message')
    }

    const data = await response.json()
    return { id: data.message_id }
  }

  private async sendLarkMessage(recipient: string, content: string): Promise<{ id: string }> {
    const response = await fetch('https://open.larksuite.com/open-apis/message/v4/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LARK_ACCESS_TOKEN')}`
      },
      body: JSON.stringify({
        receive_id: recipient,
        msg_type: 'text',
        content: { text: content }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send Lark message')
    }

    const data = await response.json()
    return { id: data.data.message_id }
  }

  private async sendSlackMessage(recipient: string, content: string): Promise<{ id: string }> {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SLACK_BOT_TOKEN')}`
      },
      body: JSON.stringify({
        channel: recipient,
        text: content
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send Slack message')
    }

    const data = await response.json()
    return { id: data.ts }
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let content = template
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return content
  }
} 