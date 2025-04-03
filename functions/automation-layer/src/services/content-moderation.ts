import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ContentModerationRequest, ContentModerationResponse } from '../types/content-moderation.ts'
import { getConfig } from '../config/index.ts'

const supabase = createClient(
  getConfig().supabase_url,
  getConfig().supabase_key
)

export class ContentModerationService {
  async moderateContent(request: ContentModerationRequest): Promise<ContentModerationResponse> {
    try {
      // 1. Check vector store for similar violations
      const vectorStoreResult = await this.checkVectorStore(request.content.text)
      
      // 2. Analyze with OpenAI
      const openaiResult = await this.analyzeWithOpenAI(request.content)
      
      // 3. Combine results and make decision
      const analysis = this.combineAnalysis(vectorStoreResult, openaiResult)
      
      // 4. Determine actions based on analysis and settings
      const actions = this.determineActions(analysis, request.moderation_settings)
      
      // 5. Execute actions if needed
      await this.executeActions(actions, request.content.post_id)
      
      return {
        analysis,
        actions,
        model_info: {
          model: 'gpt-4',
          platform: 'dify',
          ai_agent_name: 'content-moderation-agent'
        }
      }
    } catch (error) {
      console.error('Content moderation error:', error)
      throw error
    }
  }

  private async checkVectorStore(text: string) {
    const { data, error } = await supabase.rpc('match_violations', {
      query_text: text,
      match_threshold: 0.7
    })

    if (error) throw error
    return data
  }

  private async analyzeWithOpenAI(content: ContentModerationRequest['content']) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content moderation expert. Analyze the content for violations.'
          },
          {
            role: 'user',
            content: JSON.stringify(content)
          }
        ]
      })
    })

    const data = await response.json()
    return data.choices[0].message.content
  }

  private combineAnalysis(vectorStoreResult: any, openaiResult: any) {
    // Combine results from both sources
    return {
      violates: vectorStoreResult.violates || openaiResult.violates,
      confidence: Math.max(vectorStoreResult.confidence, openaiResult.confidence),
      violation_type: vectorStoreResult.violation_type || openaiResult.violation_type,
      reason: `${vectorStoreResult.reason}\n${openaiResult.reason}`,
      severity: this.determineSeverity(vectorStoreResult, openaiResult)
    }
  }

  private determineActions(analysis: any, settings: ContentModerationRequest['moderation_settings']) {
    if (!analysis.violates) {
      return {
        action_taken: 'none',
        recommendation: 'Content is safe',
        reason: 'No violations detected'
      }
    }

    if (analysis.confidence >= settings.violation_thresholds.confidence_threshold) {
      if (settings.auto_actions.hide_post) {
        return {
          action_taken: 'delete',
          recommendation: 'Content should be removed',
          reason: `High confidence violation: ${analysis.reason}`
        }
      }
    }

    if (settings.auto_actions.auto_fix) {
      return {
        action_taken: 'fix',
        recommendation: 'Content should be modified',
        fixed_content: this.generateFixedContent(analysis),
        reason: `Content can be fixed: ${analysis.reason}`
      }
    }

    return {
      action_taken: 'none',
      recommendation: 'Manual review required',
      reason: 'Settings do not allow automatic actions'
    }
  }

  private async executeActions(actions: any, postId: string) {
    if (actions.action_taken === 'delete') {
      await this.deleteFacebookPost(postId)
    } else if (actions.action_taken === 'fix') {
      await this.updateFacebookPost(postId, actions.fixed_content)
    }
  }

  private async deleteFacebookPost(postId: string) {
    await fetch(`https://graph.facebook.com/v18.0/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FACEBOOK_ACCESS_TOKEN')}`
      }
    })
  }

  private async updateFacebookPost(postId: string, content: string) {
    await fetch(`https://graph.facebook.com/v18.0/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FACEBOOK_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: content
      })
    })
  }

  private determineSeverity(vectorStoreResult: any, openaiResult: any): 'veryhigh' | 'high' | 'medium' | 'low' {
    // Implement severity determination logic
    return 'medium'
  }

  private generateFixedContent(analysis: any): string {
    // Implement content fixing logic
    return ''
  }
} 