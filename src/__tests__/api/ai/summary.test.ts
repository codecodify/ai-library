import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/ai/summary/route'
import * as generateSummaryModule from '@/lib/ai/generate-summary'

vi.mock('@/lib/ai/generate-summary')

describe('API - /api/ai/summary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return {
      json: async () => body
    } as any
  }

  it('should return 400 when content is missing', async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('内容不能为空')
  })

  it('should return 500 when summary generation fails', async () => {
    vi.mocked(generateSummaryModule.generateSummary).mockResolvedValue(null)
    
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('AI 服务未配置或生成失败')
  })

  it('should return summary on success', async () => {
    vi.mocked(generateSummaryModule.generateSummary).mockResolvedValue('Test summary')
    
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.summary).toBe('Test summary')
  })

  it('should handle unexpected errors', async () => {
    vi.mocked(generateSummaryModule.generateSummary).mockRejectedValue(new Error('Unexpected error'))
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('生成失败')
    consoleErrorSpy.mockRestore()
  })
})
