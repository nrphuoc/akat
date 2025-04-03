import { ApiConfig } from '../types/index.ts'

export function getApiConfig(): ApiConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')
  const jwtSecret = Deno.env.get('JWT_SECRET')
  const corsOrigins = Deno.env.get('CORS_ORIGINS')?.split(',') || ['*']

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !jwtSecret) {
    throw new Error('Missing required environment variables')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    jwtSecret,
    corsOrigins,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
}

export const API_VERSION = 'v1'
export const API_BASE_PATH = `/api/${API_VERSION}`

export const DEFAULT_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  INTERNAL_ERROR: 'Internal server error'
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500
}

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600 // 1 hour
}

export const AUTH_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings'
  },
  TASKS: {
    BASE: '/tasks',
    SCHEDULE: '/tasks/schedule'
  }
} 