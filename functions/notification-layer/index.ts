import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { NotificationService } from './src/services/notification.ts'
import { NOTIFICATION_ENDPOINTS, NOTIFICATION_HEADERS } from './src/config/notification.ts'

const notificationService = new NotificationService()

async function handleRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const path = url.pathname

    // Handle send requests
    if (path === NOTIFICATION_ENDPOINTS.SEND) {
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }

      const message = await req.json()
      const result = await notificationService.send(message)

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle template requests
    if (path === NOTIFICATION_ENDPOINTS.TEMPLATES) {
      if (req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 })
      }

      const provider = url.searchParams.get('provider')
      const type = url.searchParams.get('type')

      if (!provider || !type) {
        return new Response('Missing required parameters', { status: 400 })
      }

      const templates = await notificationService.getTemplates(provider, type)
      return new Response(JSON.stringify(templates), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle webhook requests
    if (path === NOTIFICATION_ENDPOINTS.WEBHOOK) {
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }

      const payload = await req.json()
      await notificationService.receive(payload)

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle status requests
    if (path === NOTIFICATION_ENDPOINTS.STATUS) {
      if (req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 })
      }

      const provider = url.searchParams.get('provider')
      const type = url.searchParams.get('type')
      const status = url.searchParams.get('status')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const messages = await notificationService.getMessages(
        provider || undefined,
        type || undefined,
        status || undefined,
        limit,
        offset
      )

      return new Response(JSON.stringify(messages), {
        headers: { 'Content-Type': 'application/json' }
      })
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