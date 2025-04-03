import { createFacebookModerationAgent } from "../agent/mod.ts";

export async function handleModeration(req: Request) {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body = await req.json();
    const agent = createFacebookModerationAgent(apiKey);
    const result = await agent.process(body);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Có thể thêm các handler khác cho các agent khác
export async function handleContentGeneration(req: Request) {
  // Logic xử lý content generation
}

export async function handleSentimentAnalysis(req: Request) {
  // Logic xử lý sentiment analysis
} 