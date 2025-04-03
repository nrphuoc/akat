import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { FacebookService } from '../services/facebook.ts'

const facebookService = new FacebookService({
  accessToken: Deno.env.get('FACEBOOK_ACCESS_TOKEN') ?? ''
})

async function handleRequest(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { action, pageId, postId, content } = await req.json()

    switch (action) {
      case 'create':
        const newPost = await facebookService.createPost(pageId, content)
        return new Response(
          JSON.stringify({ success: true, data: newPost }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'update':
        const updatedPost = await facebookService.updatePost(postId, content)
        return new Response(
          JSON.stringify({ success: true, data: updatedPost }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'delete':
        const deleteResult = await facebookService.deletePost(postId)
        return new Response(
          JSON.stringify({ success: true, data: deleteResult }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'toggle_visibility':
        const visibilityResult = await facebookService.togglePostVisibility(postId, content.is_hidden)
        return new Response(
          JSON.stringify({ success: true, data: visibilityResult }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }

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

serve(handleRequest) 