import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateVariant } from '@/lib/ai/generate-variant'
import * as config from '@/lib/ai/config'

vi.mock('@/lib/ai/config')

describe('generateVariant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should return null when AI is not configured', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue(null)
    const result = await generateVariant('test content', 'chatgpt')
    expect(result).toBeNull()
  })

  it('should generate variant with OpenAI provider for ChatGPT', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'Converted for ChatGPT' } }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await generateVariant('test content', 'chatgpt')
    expect(result).toBe('Converted for ChatGPT')
  })

  it('should generate variant with Anthropic provider', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'anthropic',
      apiKey: 'test-key'
    })

    const mockResponse = {
      content: [{ text: 'Converted for Claude' }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await generateVariant('test content', 'claude')
    expect(result).toBe('Converted for Claude')
  })

  it('should include platform-specific instructions in prompt', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'Test' } }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    await generateVariant('test content', 'cursor')
    
    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)
    expect(body.messages[0].content).toContain('Cursor')
  })

  it('should handle each supported platform', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'Test' } }]
    }

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => mockResponse
    } as Response)

    const platforms = ['chatgpt', 'cursor', 'claude', 'dify', 'coze', 'notion', 'generic']
    
    for (const platform of platforms) {
      const result = await generateVariant('test content', platform as any)
      expect(result).toBe('Test')
    }
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API error'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await generateVariant('test content', 'chatgpt')
    expect(result).toBeNull()
    consoleErrorSpy.mockRestore()
  })
})
