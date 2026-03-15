import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/ai/tags/route'
import * as suggestTagsModule from '@/lib/ai/suggest-tags'

vi.mock('@/lib/ai/suggest-tags')

describe('API - /api/ai/tags', () => {
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

  it('should return 500 when tag suggestion fails', async () => {
    vi.mocked(suggestTagsModule.suggestTags).mockResolvedValue([])
    
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('AI 服务未配置或生成失败')
  })

  it('should return tags on success', async () => {
    vi.mocked(suggestTagsModule.suggestTags).mockResolvedValue(['tag1', 'tag2', 'tag3'])
    
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should pass existingTags to suggestTags', async () => {
    vi.mocked(suggestTagsModule.suggestTags).mockResolvedValue(['newtag'])
    
    const request = createMockRequest({ 
      content: 'test content',
      existingTags: ['existing1', 'existing2']
    })
    await POST(request)
    
    expect(suggestTagsModule.suggestTags).toHaveBeenCalledWith(
      'test content',
      ['existing1', 'existing2']
    )
  })

  it('should handle unexpected errors', async () => {
    vi.mocked(suggestTagsModule.suggestTags).mockRejectedValue(new Error('Unexpected error'))
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('生成失败')
    consoleErrorSpy.mockRestore()
  })
})
