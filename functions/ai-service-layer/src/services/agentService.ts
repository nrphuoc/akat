import { AIAgentConfig } from '../types/index.ts'
import { getAIServiceConfig, DEFAULT_MODEL_CONFIG } from '../config/ai.ts'

export class AgentService {
  private config: AIServiceConfig

  constructor() {
    this.config = getAIServiceConfig()
  }

  async createAgent(agentConfig: AIAgentConfig) {
    const response = await fetch('https://api.langchain.com/v1/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.langchain_api_key}`
      },
      body: JSON.stringify({
        name: agentConfig.name,
        description: agentConfig.description,
        capabilities: agentConfig.capabilities,
        model: agentConfig.model || DEFAULT_MODEL_CONFIG.model,
        temperature: agentConfig.temperature || DEFAULT_MODEL_CONFIG.temperature,
        max_tokens: agentConfig.max_tokens || DEFAULT_MODEL_CONFIG.max_tokens
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create agent')
    }

    return await response.json()
  }

  async runAgent(agentId: string, input: string, context?: Record<string, any>) {
    const response = await fetch(`https://api.langchain.com/v1/agents/${agentId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.langchain_api_key}`
      },
      body: JSON.stringify({
        input,
        context
      })
    })

    if (!response.ok) {
      throw new Error('Failed to run agent')
    }

    return await response.json()
  }
} 