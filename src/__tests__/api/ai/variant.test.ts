import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/ai/variant/route'
import * as generateVariantModule from '@/lib/ai/generate-variant'

vi.mock('@/lib/ai/generate-variant')

describe('API - /api/ai/variant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return {
      json: async () => body
    } as any
  }

  it('should return 400 when content is missing', async () => {
    const request = createMockRequest({ platform: 'chatgpt' })
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('内容和平台不能为空')
  })

  it('should return 400 when platform is missing', async () => {
    const request = createMockRequest({ content: 'test content' })
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('内容和平台不能为空')
  })

  it('should return 500 when variant generation fails', async () => {
    vi.mocked(generateVariantModule.generateVariant).mockResolvedValue(null)
    
    const request = createMockRequest({ content: 'test content', platform: 'chatgpt' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('AI 服务未配置或生成失败')
  })

  it('should return variant content on success', async () => {
    vi.mocked(generateVariantModule.generateVariant).mockResolvedValue('Converted content')
    
    const request = createMockRequest({ content: 'test content', platform: 'chatgpt' })
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.content).toBe('Converted content')
  })

  it('should handle unexpected errors', async () => {
    vi.mocked(generateVariantModule.generateVariant).mockRejectedValue(new Error('Unexpected error'))
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const request = createMockRequest({ content: 'test content', platform: 'chatgpt' })
    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('生成失败')
    consoleErrorSpy.mockRestore()
  })
})
