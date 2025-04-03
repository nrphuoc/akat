import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { NotificationConfig, NotificationMessage, NotificationResponse, NotificationError } from '../types/index.ts'
import { getNotificationConfig, NOTIFICATION_ERRORS, NOTIFICATION_MESSAGES } from '../config/notification.ts'
import { Resend } from 'https://esm.sh/resend@1.0.0'

export class EmailProvider {
  private supabase
  private config: NotificationConfig
  private resend: Resend

  constructor() {
    this.config = getNotificationConfig()
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    )
    this.resend = new Resend(Deno.env.get('RESEND_API_KEY'))
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

      // Send email
      const result = await this.resend.emails.send({
        from: Deno.env.get('EMAIL_FROM') || 'noreply@example.com',
        to: message.recipient,
        subject: message.subject || 'Notification',
        html: content
      })

      // Store message
      await this.supabase.from('notification_messages').insert({
        id: result.id,
        provider: 'email',
        type: 'email',
        recipient: message.recipient,
        subject: message.subject,
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
        provider: 'email',
        type: 'email',
        recipient: message.recipient,
        subject: message.subject,
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
      // Store received email
      await this.supabase.from('notification_messages').insert({
        provider: 'email',
        type: 'email',
        recipient: payload.from,
        subject: payload.subject,
        content: payload.text,
        status: 'received'
      })
    } catch (error) {
      console.error('Error receiving email:', error)
      throw error
    }
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let content = template
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return content
  }
} 