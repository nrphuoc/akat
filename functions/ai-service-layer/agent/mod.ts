export * from "./base-agent.ts";
export * from "./facebook-moderation-agent.ts";

import { FacebookModerationAgent } from "./facebook-moderation-agent.ts";

// Export hàm tạo agent
export const createFacebookModerationAgent = (apiKey: string) => {
  return new FacebookModerationAgent({
    model: 'gpt-4',
    platform: 'openai',
    ai_agent_name: 'facebook-moderation-agent',
    apiKey,
    confidence_threshold: 0.8
  });
}; 