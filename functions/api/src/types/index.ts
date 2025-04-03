import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface ApiConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  jwtSecret: string
  corsOrigins: string[]
  rateLimit: {
    windowMs: number
    max: number
  }
}

export interface ApiContext {
  supabase: SupabaseClient
  user: {
    id: string
    email: string
    role: string
  } | null
  request: Request
  params: Record<string, string>
  query: Record<string, string>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface ApiError extends Error {
  code: string
  status: number
  details?: any
}

export interface ApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  handler: (context: ApiContext) => Promise<Response>
  middleware?: ((context: ApiContext) => Promise<void>)[]
  auth?: {
    required: boolean
    roles?: string[]
  }
}

export interface ApiMiddleware {
  name: string
  handler: (context: ApiContext) => Promise<void>
}

export interface ApiService {
  name: string
  methods: {
    [key: string]: (context: ApiContext, ...args: any[]) => Promise<any>
  }
}

export interface ApiValidationSchema {
  body?: Record<string, any>
  query?: Record<string, any>
  params?: Record<string, any>
}

export interface ApiRateLimit {
  ip: string
  count: number
  resetTime: number
}

export interface ApiCache {
  key: string
  value: any
  ttl: number
  createdAt: number
} 