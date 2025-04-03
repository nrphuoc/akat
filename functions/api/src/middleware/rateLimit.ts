import { ApiContext, ApiError, ApiRateLimit } from '../types/index.ts'
import { HTTP_STATUS, DEFAULT_ERROR_MESSAGES } from '../config/api.ts'

const rateLimitStore = new Map<string, ApiRateLimit>()

export async function rateLimitMiddleware(context: ApiContext): Promise<void> {
  const ip = context.request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const rateLimit = rateLimitStore.get(ip) || {
    ip,
    count: 0,
    resetTime: now + 15 * 60 * 1000 // 15 minutes
  }

  if (now > rateLimit.resetTime) {
    rateLimit.count = 0
    rateLimit.resetTime = now + 15 * 60 * 1000
  }

  rateLimit.count++
  rateLimitStore.set(ip, rateLimit)

  if (rateLimit.count > 100) {
    throw createApiError(DEFAULT_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.RATE_LIMIT_EXCEEDED)
  }
}

function createApiError(message: string, status: number): ApiError {
  const error = new Error(message) as ApiError
  error.code = `HTTP_${status}`
  error.status = status
  return error
} 