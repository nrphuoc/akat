import { CacheConfig } from '../types/index.ts'

export function getCacheConfig(): CacheConfig {
  const redisUrl = Deno.env.get('REDIS_URL')
  const redisPassword = Deno.env.get('REDIS_PASSWORD')
  const defaultTTL = parseInt(Deno.env.get('CACHE_DEFAULT_TTL') || '3600')
  const maxRetries = parseInt(Deno.env.get('CACHE_MAX_RETRIES') || '3')
  const retryDelay = parseInt(Deno.env.get('CACHE_RETRY_DELAY') || '1000')
  const prefix = Deno.env.get('CACHE_PREFIX') || 'cache:'

  if (!redisUrl || !redisPassword) {
    throw new Error('Missing required Redis configuration')
  }

  return {
    redisUrl,
    redisPassword,
    defaultTTL,
    maxRetries,
    retryDelay,
    prefix
  }
}

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  EXTRA_LONG: 86400 // 24 hours
}

export const CACHE_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
}

export const CACHE_TAGS = {
  USER: 'user',
  TASK: 'task',
  AUTH: 'auth',
  SYSTEM: 'system'
}

export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  TASK: (id: string) => `task:${id}`,
  AUTH: (token: string) => `auth:${token}`,
  SYSTEM: (key: string) => `system:${key}`
}

export const CACHE_ERRORS = {
  CONNECTION: 'REDIS_CONNECTION_ERROR',
  TIMEOUT: 'REDIS_TIMEOUT_ERROR',
  INVALIDATION: 'CACHE_INVALIDATION_ERROR',
  COMPRESSION: 'CACHE_COMPRESSION_ERROR',
  SERIALIZATION: 'CACHE_SERIALIZATION_ERROR'
}

export const CACHE_MESSAGES = {
  HIT: 'Cache hit',
  MISS: 'Cache miss',
  ERROR: 'Cache error',
  EVICTION: 'Cache eviction',
  INVALIDATION: 'Cache invalidation'
} 