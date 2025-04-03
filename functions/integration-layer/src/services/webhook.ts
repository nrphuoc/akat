import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { IntegrationConfig, IntegrationResponse, IntegrationError } from '../types/index.ts'
import { getIntegrationConfig, INTEGRATION_ERRORS, INTEGRATION_MESSAGES } from '../config/integration.ts'
import { createHash, createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

export class WebhookService {
  private supabase
  private config: IntegrationConfig

  constructor() {
    this.config = getIntegrationConfig()
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    )
  }

  async handleWebhook(
    provider: string,
    payload: unknown,
    signature: string
  ): Promise<IntegrationResponse> {
    try {
      // Verify webhook signature
      if (!this.verifySignature(payload, signature)) {
        throw new Error(INTEGRATION_ERRORS.WEBHOOK)
      }

      // Store webhook event
      const { data: event, error: eventError } = await this.supabase
        .from('webhook_events')
        .insert({
          provider,
          payload,
          signature,
          status: 'received'
        })
        .select()
        .single()

      if (eventError) {
        throw eventError
      }

      // Process webhook based on provider
      const result = await this.processWebhook(provider, payload)

      // Update event status
      await this.supabase
        .from('webhook_events')
        .update({ status: 'processed' })
        .eq('id', event.id)

      return {
        success: true,
        message: INTEGRATION_MESSAGES.WEBHOOK,
        data: result
      }
    } catch (error) {
      const integrationError = error as IntegrationError
      integrationError.code = INTEGRATION_ERRORS.WEBHOOK
      throw integrationError
    }
  }

  private verifySignature(payload: unknown, signature: string): boolean {
    const hmac = createHmac('sha256', this.config.webhookSecret)
    const payloadString = JSON.stringify(payload)
    const calculatedSignature = hmac.update(payloadString).digest('hex')
    return calculatedSignature === signature
  }

  private async processWebhook(
    provider: string,
    payload: unknown
  ): Promise<unknown> {
    // Process webhook based on provider
    switch (provider) {
      case 'github':
        return this.processGithubWebhook(payload)
      case 'slack':
        return this.processSlackWebhook(payload)
      case 'stripe':
        return this.processStripeWebhook(payload)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private async processGithubWebhook(payload: unknown): Promise<unknown> {
    // Process GitHub webhook
    const githubPayload = payload as {
      repository: { name: string }
      sender: { login: string }
      action: string
    }

    // Store GitHub event
    await this.supabase.from('github_events').insert({
      repository: githubPayload.repository.name,
      sender: githubPayload.sender.login,
      action: githubPayload.action,
      payload
    })

    return { processed: true }
  }

  private async processSlackWebhook(payload: unknown): Promise<unknown> {
    // Process Slack webhook
    const slackPayload = payload as {
      type: string
      user: string
      text: string
    }

    // Store Slack event
    await this.supabase.from('slack_events').insert({
      type: slackPayload.type,
      user: slackPayload.user,
      text: slackPayload.text,
      payload
    })

    return { processed: true }
  }

  private async processStripeWebhook(payload: unknown): Promise<unknown> {
    // Process Stripe webhook
    const stripePayload = payload as {
      type: string
      data: { object: unknown }
    }

    // Store Stripe event
    await this.supabase.from('stripe_events').insert({
      type: stripePayload.type,
      data: stripePayload.data.object,
      payload
    })

    return { processed: true }
  }
} 