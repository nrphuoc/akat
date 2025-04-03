import { ApiResponse } from '../types/index.ts'
import { HTTP_STATUS } from '../config/api.ts'

export class ResponseService {
  static success<T>(data: T, status: number = HTTP_STATUS.OK): Response {
    const response: ApiResponse<T> = {
      success: true,
      data
    }

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  static error(error: Error, status: number = HTTP_STATUS.INTERNAL_ERROR): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.name,
        message: error.message,
        details: (error as any).details
      }
    }

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  static notFound(message: string = 'Resource not found'): Response {
    return this.error(new Error(message), HTTP_STATUS.NOT_FOUND)
  }

  static unauthorized(message: string = 'Unauthorized access'): Response {
    return this.error(new Error(message), HTTP_STATUS.UNAUTHORIZED)
  }

  static forbidden(message: string = 'Access forbidden'): Response {
    return this.error(new Error(message), HTTP_STATUS.FORBIDDEN)
  }

  static badRequest(message: string, details?: any): Response {
    const error = new Error(message)
    ;(error as any).details = details
    return this.error(error, HTTP_STATUS.BAD_REQUEST)
  }

  static rateLimitExceeded(message: string = 'Too many requests'): Response {
    return this.error(new Error(message), HTTP_STATUS.RATE_LIMIT_EXCEEDED)
  }
} 