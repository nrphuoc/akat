import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { CacheService } from './src/services/cache.ts'
import { CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from './src/config/cache.ts'

const cache = new CacheService()

async function handleRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method
    const body = method === 'POST' ? await req.json() : null

    // Xử lý các request
    switch (path) {
      case '/cache/get':
        if (method !== 'POST') {
          return new Response('Method not allowed', { status: 405 })
        }
        return await handleGet(body)

      case '/cache/set':
        if (method !== 'POST') {
          return new Response('Method not allowed', { status: 405 })
        }
        return await handleSet(body)

      case '/cache/delete':
        if (method !== 'POST') {
          return new Response('Method not allowed', { status: 405 })
        }
        return await handleDelete(body)

      case '/cache/clear':
        if (method !== 'POST') {
          return new Response('Method not allowed', { status: 405 })
        }
        return await handleClear()

      case '/cache/stats':
        if (method !== 'GET') {
          return new Response('Method not allowed', { status: 405 })
        }
        return await handleStats()

      case '/cache/invalidate':
        if (method !== 'POST') {
          return new Response('Method not allowed', { status: 405 })
        }
        return await handleInvalidate(body)

      default:
        return new Response('Not found', { status: 404 })
    }
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code || 'INTERNAL_ERROR'
      }),
      { 
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleGet(body: any): Promise<Response> {
  if (!body?.key) {
    return new Response(
      JSON.stringify({ error: 'Key is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const data = await cache.get(body.key)
  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleSet(body: any): Promise<Response> {
  if (!body?.key || body?.value === undefined) {
    return new Response(
      JSON.stringify({ error: 'Key and value are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  await cache.set(body.key, body.value, {
    ttl: body.ttl,
    tags: body.tags,
    priority: body.priority,
    compress: body.compress
  })

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleDelete(body: any): Promise<Response> {
  if (!body?.key) {
    return new Response(
      JSON.stringify({ error: 'Key is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  await cache.delete(body.key)
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleClear(): Promise<Response> {
  await cache.clear()
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleStats(): Promise<Response> {
  const stats = await cache.getStats()
  return new Response(
    JSON.stringify({ success: true, data: stats }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleInvalidate(body: any): Promise<Response> {
  if (!body?.tags || !Array.isArray(body.tags)) {
    return new Response(
      JSON.stringify({ error: 'Tags array is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  await cache.invalidateByTags(body.tags)
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

serve(handleRequest) 