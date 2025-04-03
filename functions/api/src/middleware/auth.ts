import { ApiContext, ApiError } from '../types/index.ts'
import { HTTP_STATUS, DEFAULT_ERROR_MESSAGES } from '../config/api.ts'

export async function authMiddleware(context: ApiContext): Promise<void> {
  const authHeader = context.request.headers.get('Authorization')
  
  if (!authHeader) {
    throw createApiError(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
  }

  const [type, token] = authHeader.split(' ')
  
  if (type !== 'Bearer' || !token) {
    throw createApiError(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
  }

  try {
    const { data: { user }, error } = await context.supabase.auth.getUser(token)
    
    if (error || !user) {
      throw createApiError(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    context.user = {
      id: user.id,
      email: user.email!,
      role: user.role || 'user'
    }
  } catch (error) {
    throw createApiError(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
  }
}

export async function roleMiddleware(roles: string[])(context: ApiContext): Promise<void> {
  if (!context.user) {
    throw createApiError(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
  }

  if (!roles.includes(context.user.role)) {
    throw createApiError(DEFAULT_ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
  }
}

export function createApiError(message: string, status: number): ApiError {
  const error = new Error(message) as ApiError
  error.code = `HTTP_${status}`
  error.status = status
  return error
} 