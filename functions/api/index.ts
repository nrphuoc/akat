import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ApiContext, ApiRoute } from './src/types/index.ts'
import { getApiConfig, API_BASE_PATH } from './src/config/api.ts'
import { rateLimitMiddleware } from './src/middleware/rateLimit.ts'
import { userRoutes } from './src/routes/users.ts'

const config = getApiConfig()
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

// Combine all routes
const routes: ApiRoute[] = [
  ...userRoutes
]

// Create route map for faster lookup
const routeMap = new Map<string, ApiRoute>()
for (const route of routes) {
  const key = `${route.method}:${route.path}`
  routeMap.set(key, route)
}

async function handleRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const path = url.pathname.replace(API_BASE_PATH, '')
    const method = req.method
    const key = `${method}:${path}`

    // Find matching route
    const route = routeMap.get(key)
    if (!route) {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create context
    const context: ApiContext = {
      supabase,
      user: null,
      request: req,
      params: {},
      query: Object.fromEntries(url.searchParams)
    }

    // Apply rate limit middleware
    await rateLimitMiddleware(context)

    // Apply route middleware
    if (route.middleware) {
      for (const middleware of route.middleware) {
        await middleware(context)
      }
    }

    // Extract path parameters
    const pathRegex = new RegExp(
      '^' + route.path.replace(/:[^/]+/g, '([^/]+)') + '$'
    )
    const matches = path.match(pathRegex)
    if (matches) {
      const paramNames = route.path.match(/:[^/]+/g) || []
      for (let i = 0; i < paramNames.length; i++) {
        const paramName = paramNames[i].slice(1)
        context.params[paramName] = matches[i + 1]
      }
    }

    // Handle request
    return await route.handler(context)

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

serve(handleRequest) 