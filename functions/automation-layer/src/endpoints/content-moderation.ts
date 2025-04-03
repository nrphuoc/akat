import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { ContentModerationService } from '../services/content-moderation.ts'
import { ContentModerationRequest } from '../types/content-moderation.ts'

const moderationService = new ContentModerationService()

export async function handleContentModeration(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const request: ContentModerationRequest = await req.json()
    const result = await moderationService.moderateContent(request)

    return new Response(    
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handleContentModeration) 