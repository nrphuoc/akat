import { BaseAgent, BaseAgentConfig } from './base-agent.ts';
import { FACEBOOK_COMMUNITY_STANDARDS } from '../standards/facebook-community-standards.ts';

interface ContentInput {
  content: {
    text: string;
    type: 'post' | 'comment';
    media?: {
      images?: string[];
      videos?: string[];
    };
  };
  moderation_settings: {
    auto_actions: {
      hide_post: boolean;
      auto_fix: boolean;
    };
    violation_thresholds: {
      confidence_threshold: number;
    };
  };
}

interface AnalysisResult {
  violates: boolean;
  confidence: number;
  violation_type: string;
  reason: string;
  severity: 'veryhigh' | 'high' | 'medium' | 'low';
}

interface ActionResult {
  action_taken: 'delete' | 'fix' | 'none';
  recommendation: string;
  fixed_content?: string;
  reason: string;
}

export class FacebookModerationAgent extends BaseAgent {
  constructor(config: BaseAgentConfig) {
    super(config);
  }

  protected async analyzeContent(input: ContentInput): Promise<AnalysisResult> {
    try {
      const result = await this.callOpenAI('chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "Bạn là AI kiểm duyệt nội dung. CHỈ trả về JSON object, không kèm giải thích, không dùng markdown. Phân tích và trả về kết quả bằng tiếng Việt."
          },
          {
            role: "user",
            content: `Phân tích nội dung sau và CHỈ trả về JSON object:
            Nội dung: ${input.content.text}
            Loại: ${input.content.type}
            Media: ${JSON.stringify(input.content.media)}
            
            CHÚ Ý: CHỈ trả về JSON object có dạng:
            {
              "violates": boolean,
              "confidence": số từ 0-1,
              "violation_type": "string - loại vi phạm hoặc 'không vi phạm'",
              "reason": "string - lý do chi tiết bằng tiếng Việt",
              "severity": "veryhigh" hoặc "high" hoặc "medium" hoặc "low"
            }
            KHÔNG THÊM BẤT KỲ TEXT NÀO KHÁC.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      try {
        const analysis = JSON.parse(result.choices[0].message.content.trim());
        return analysis;
      } catch (error) {
        throw new Error(`Failed to parse OpenAI response: ${error.message}\nResponse: ${result.choices[0].message.content}`);
      }
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  protected async takeAction(analysis: AnalysisResult): Promise<ActionResult> {
    try {
      // Nếu confidence dưới ngưỡng, không làm gì cả
      if (analysis.confidence < this.config.confidence_threshold) {
        return {
          action_taken: 'none',
          recommendation: 'Không đủ độ tin cậy để đưa ra hành động',
          reason: 'Độ tin cậy dưới ngưỡng cho phép'
        };
      }

      // Nếu không vi phạm, không làm gì cả
      if (!analysis.violates) {
        return {
          action_taken: 'none',
          recommendation: 'Nội dung không vi phạm',
          reason: 'Nội dung tuân thủ tiêu chuẩn cộng đồng'
        };
      }

      // Nếu vi phạm và đủ độ tin cậy
      if (analysis.severity === 'veryhigh' || analysis.severity === 'high') {
        return {
          action_taken: 'delete',
          recommendation: 'Nên xóa nội dung này',
          reason: `Vi phạm nghiêm trọng: ${analysis.reason}`
        };
      }

      // Với các vi phạm mức độ thấp hơn
      const fixResult = await this.callOpenAI('chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "Bạn là AI sửa nội dung. Hãy sửa nội dung để phù hợp với tiêu chuẩn cộng đồng, giữ nguyên ý nghĩa và trả lời bằng tiếng Việt."
          },
          {
            role: "user",
            content: `Sửa nội dung sau. Vi phạm: ${analysis.violation_type}
            Nội dung gốc: ${input.content.text}`
          }
        ],
        temperature: 0.3
      });

      return {
        action_taken: 'fix',
        recommendation: 'Nội dung cần được điều chỉnh',
        fixed_content: fixResult.choices[0].message.content,
        reason: `Đã sửa để khắc phục: ${analysis.reason}`
      };
    } catch (error) {
      return {
        action_taken: 'none',
        recommendation: 'Không thể xử lý nội dung',
        reason: `Lỗi trong quá trình xử lý: ${error.message}`
      };
    }
  }

  // Override process method để truyền content vào takeAction
  public async process(input: ContentInput): Promise<any> {
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