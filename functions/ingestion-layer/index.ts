import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createSupabaseClient } from './src/config/supabase.ts'
import { PageService } from './src/services/pageService.ts'
import { validateInput } from './src/utils/validators.ts'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createMethodNotAllowedResponse 
} from './src/utils/response.ts'
import { RequestBody } from './src/types/index.ts'

async function handleRequest(req: Request) {
  try {
    // Kiểm tra phương thức HTTP
    if (req.method !== 'POST') {
      return createMethodNotAllowedResponse()
    }

    // Lấy và validate dữ liệu
    const { data } = await req.json() as RequestBody
    validateInput(data)

    // Khởi tạo service và lưu dữ liệu
    const supabase = createSupabaseClient()
    const pageService = new PageService(supabase)

    // Lưu thông tin page
    await pageService.savePageDetails({
      page_id: data.page_id,
      page_name: data.page_name,
      page_category: data.page_category,
      follower_count: data.follower_count,
      page_avatar_url: data.page_avatar_url,
      updated_at: new Date().toISOString()
    })

    // Lưu metrics nếu có
    if (data.metrics) {
      await pageService.savePageMetrics({
        page_id: data.page_id,
        likes: data.metrics.likes,
        engagement: data.metrics.engagement,
        reach: data.metrics.reach,
        response_rate: data.metrics.response_rate,
        posts: data.metrics.posts,
        updated_at: new Date().toISOString()
      })
    }

    // Cập nhật trạng thái kết nối
    await pageService.updateConnectionStatus({
      page_id: data.page_id,
      status: 'connected',
      last_sync: new Date().toISOString()
    })

    return createSuccessResponse('Data ingested successfully')

  } catch (error) {
    return createErrorResponse(error as Error)
  }
}

serve(handleRequest) 