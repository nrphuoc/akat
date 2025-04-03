import { ApiContext, ApiRoute } from '../types/index.ts'
import { ResponseService } from '../services/response.ts'
import { ValidationService } from '../services/validation.ts'
import { authMiddleware, roleMiddleware } from '../middleware/auth.ts'
import { AUTH_ROLES } from '../config/api.ts'

const userSchema = {
  body: {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { type: 'string', required: true, min: 2, max: 50 },
    role: { type: 'string', required: true, enum: Object.values(AUTH_ROLES) }
  }
}

export const userRoutes: ApiRoute[] = [
  {
    method: 'GET',
    path: '/users',
    handler: async (context: ApiContext) => {
      await ValidationService.validate(context, {
        query: {
          page: { type: 'number', min: 1 },
          limit: { type: 'number', min: 1, max: 100 }
        }
      })

      const page = parseInt(context.query.page || '1')
      const limit = parseInt(context.query.limit || '10')
      const offset = (page - 1) * limit

      const { data, error } = await context.supabase
        .from('users')
        .select('*')
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return ResponseService.success(data)
    },
    middleware: [authMiddleware, roleMiddleware([AUTH_ROLES.ADMIN])]
  },
  {
    method: 'GET',
    path: '/users/:id',
    handler: async (context: ApiContext) => {
      const { data, error } = await context.supabase
        .from('users')
        .select('*')
        .eq('id', context.params.id)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        return ResponseService.notFound()
      }

      return ResponseService.success(data)
    },
    middleware: [authMiddleware]
  },
  {
    method: 'POST',
    path: '/users',
    handler: async (context: ApiContext) => {
      await ValidationService.validate(context, userSchema)

      const body = await context.request.json()
      const { data, error } = await context.supabase
        .from('users')
        .insert(body)
        .select()
        .single()

      if (error) {
        throw error
      }

      return ResponseService.success(data, 201)
    },
    middleware: [authMiddleware, roleMiddleware([AUTH_ROLES.ADMIN])]
  },
  {
    method: 'PUT',
    path: '/users/:id',
    handler: async (context: ApiContext) => {
      await ValidationService.validate(context, userSchema)

      const body = await context.request.json()
      const { data, error } = await context.supabase
        .from('users')
        .update(body)
        .eq('id', context.params.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        return ResponseService.notFound()
      }

      return ResponseService.success(data)
    },
    middleware: [authMiddleware, roleMiddleware([AUTH_ROLES.ADMIN])]
  },
  {
    method: 'DELETE',
    path: '/users/:id',
    handler: async (context: ApiContext) => {
      const { error } = await context.supabase
        .from('users')
        .delete()
        .eq('id', context.params.id)

      if (error) {
        throw error
      }

      return ResponseService.success(null)
    },
    middleware: [authMiddleware, roleMiddleware([AUTH_ROLES.ADMIN])]
  }
] 