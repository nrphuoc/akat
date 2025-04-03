export interface BaseAgentConfig {
  model: string;
  platform: string;
  ai_agent_name: string;
  apiKey: string;
  confidence_threshold: number;
}

export abstract class BaseAgent {
  protected config: BaseAgentConfig;
  protected baseUrl = "https://api.openai.com/v1";

  constructor(config: BaseAgentConfig) {
    this.config = config;
  }

  // Helper method để gọi OpenAI API
  protected async callOpenAI(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return await response.json();
  }

  protected async analyzeContent(content: any): Promise<any> {
    throw new Error('Method analyzeContent must be implemented');
  }

  protected async takeAction(analysis: any): Promise<any> {
    throw new Error('Method takeAction must be implemented');
  }

  public async process(input: any): Promise<any> {
    const analysis = await this.analyzeContent(input);
    const actions = await this.takeAction(analysis);
    
    return {
      analysis,
      actions,
      model_info: {
        model: this.config.model,
        platform: this.config.platform,
        ai_agent_name: this.config.ai_agent_name
      }
    };
  }
} 