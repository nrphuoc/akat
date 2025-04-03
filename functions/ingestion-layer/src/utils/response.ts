export function createSuccessResponse(message: string) {
  return new Response(
    JSON.stringify({ 
      message,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export function createErrorResponse(error: Error, status: number = 500) {
  console.error('Error in ingestion layer:', error)
  return new Response(
    JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }),
    { 
      status, 
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export function createMethodNotAllowedResponse() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  )
} 