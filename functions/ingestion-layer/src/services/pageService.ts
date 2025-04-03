import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PageDetails, PageMetrics, ConnectionStatus } from '../types/index.ts'

export class PageService {
  constructor(private supabase: SupabaseClient) {}

  async savePageDetails(data: PageDetails) {
    const { error } = await this.supabase
      .from('facebook_page_details')
      .upsert(data)

    if (error) throw error
  }

  async savePageMetrics(data: PageMetrics) {
    const { error } = await this.supabase
      .from('facebook_page_metrics')
      .upsert(data)

    if (error) throw error
  }

  async updateConnectionStatus(data: ConnectionStatus) {
    const { error } = await this.supabase
      .from('facebook_connections')
      .upsert(data)

    if (error) throw error
  }
} 