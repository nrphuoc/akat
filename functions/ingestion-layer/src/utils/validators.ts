import { RequestBody } from '../types/index.ts'

export function validateInput(data: RequestBody['data']) {
  if (!data.page_id || !data.page_name) {
    throw new Error('Missing required fields')
  }
} 