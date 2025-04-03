import { getAIServiceConfig, DEFAULT_MODEL_CONFIG } from '../config/ai.ts'

export class OpenAIService {
  private apiKey: string

  constructor() {
    this.apiKey = getAIServiceConfig().openai_api_key
  }

  async generateCompletion(prompt: string, options = DEFAULT_MODEL_CONFIG) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        top_p: options.top_p
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate completion')
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async analyzeSentiment(text: string) {
    const prompt = `Analyze the sentiment of the following text and return a JSON object with the sentiment (positive, negative, or neutral) and a confidence score between 0 and 1: "${text}"`
    
    const result = await this.generateCompletion(prompt, {
      ...DEFAULT_MODEL_CONFIG,
      temperature: 0.3
    })

    return JSON.parse(result)
  }

  async extractKeywords(text: string) {
    const prompt = `Extract the main keywords from the following text and return them as a JSON array: "${text}"`
    
    const result = await this.generateCompletion(prompt, {
      ...DEFAULT_MODEL_CONFIG,
      temperature: 0.3
    })

    return JSON.parse(result)
  }
} 