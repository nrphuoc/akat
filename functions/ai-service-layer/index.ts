import { createFacebookModerationAgent } from "./agent/mod.ts";

// Dùng Deno.serve thay vì Express
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    
    // Kiểm tra method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sửa lại điều kiện kiểm tra pathname
    if (url.pathname === '/ai-service-layer/moderation') {
      const apiKey = Deno.env.get('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const body = await req.json();
      const agent = createFacebookModerationAgent(apiKey);
      const result = await agent.process(body);

      return new Response(
        JSON.stringify(result),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found', path: url.pathname }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

export * from './agent/facebook-moderation-agent.ts';
export * from './standards/facebook-community-standards.ts'; 