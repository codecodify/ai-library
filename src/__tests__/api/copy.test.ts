import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/copy/route'
import * as supabaseServer from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

describe('API - /api/copy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return {
      json: async () => body
    } as any
  }

  it('should return 400 when resourceId is missing', async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('资源 ID 不能为空')
  })

  it('should update copy count successfully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { copy_count: 5 } }),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase as any)

    const request = createMockRequest({ resourceId: 'test-id' })
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.count).toBe(6)
  })

  it('should handle resources with no copy_count', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase as any)

    const request = createMockRequest({ resourceId: 'test-id' })
    const response = await POST(request)
    
    const data = await response.json()
    expect(data.count).toBe(1)
  })

  it('should handle unexpected errors', async () => {
    vi.mocked(supabaseServer.createClient).mockRejectedValue(new Error('DB Error'))
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const request = createMockRequest({ resourceId: 'test-id' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('更新失败')
    consoleErrorSpy.mockRestore()
  })
})
