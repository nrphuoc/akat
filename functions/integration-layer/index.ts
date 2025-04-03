import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { WebhookService } from './src/services/webhook.ts'
import { OAuthService } from './src/services/oauth.ts'
import { TokenService } from './src/services/token.ts'
import { INTEGRATION_ENDPOINTS, INTEGRATION_HEADERS } from './src/config/integration.ts'

const webhookService = new WebhookService()
const oauthService = new OAuthService()
const tokenService = new TokenService()

async function handleRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const path = url.pathname

    // Handle webhook requests
    if (path === INTEGRATION_ENDPOINTS.WEBHOOK) {
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }

      const provider = req.headers.get(INTEGRATION_HEADERS.PROVIDER)
      const signature = req.headers.get(INTEGRATION_HEADERS.WEBHOOK_SIGNATURE)

      if (!provider || !signature) {
        return new Response('Missing required headers', { status: 400 })
      }

      const payload = await req.json()
      const result = await webhookService.handleWebhook(provider, payload, signature)

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle OAuth requests
    if (path === INTEGRATION_ENDPOINTS.OAUTH) {
      if (req.method === 'GET') {
        const provider = url.searchParams.get('provider')
        const redirectUri = url.searchParams.get('redirect_uri')

        if (!provider || !redirectUri) {
          return new Response('Missing required parameters', { status: 400 })
        }

        const result = await oauthService.initiateOAuth(provider, redirectUri)
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (req.method === 'POST') {
        const { provider, code, state } = await req.json()

        if (!provider || !code || !state) {
          return new Response('Missing required parameters', { status: 400 })
        }

        const result = await oauthService.handleOAuthCallback(provider, code, state)
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response('Method not allowed', { status: 405 })
    }

    // Handle token requests
    if (path === INTEGRATION_ENDPOINTS.CALLBACK) {
      if (req.method === 'GET') {
        const provider = url.searchParams.get('provider')

        if (!provider) {
          return new Response('Missing required parameters', { status: 400 })
        }

        const result = await tokenService.getToken(provider)
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (req.method === 'DELETE') {
        const provider = url.searchParams.get('provider')

        if (!provider) {
          return new Response('Missing required parameters', { status: 400 })
        }

        const result = await tokenService.revokeToken(provider)
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response('Method not allowed', { status: 405 })
    }

    // Handle status requests
    if (path === INTEGRATION_ENDPOINTS.STATUS) {
      if (req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 })
      }

      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response('Not found', { status: 404 })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handleRequest) 