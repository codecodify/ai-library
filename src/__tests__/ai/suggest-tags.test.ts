import { describe, it, expect, beforeEach, vi } from 'vitest'
import { suggestTags } from '@/lib/ai/suggest-tags'
import * as config from '@/lib/ai/config'

vi.mock('@/lib/ai/config')

describe('suggestTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should return empty array when AI is not configured', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue(null)
    const result = await suggestTags('test content')
    expect(result).toEqual([])
  })

  it('should suggest tags with OpenAI provider', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'tag1, tag2, tag3' } }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await suggestTags('test content')
    expect(result).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should suggest tags with Anthropic provider', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'anthropic',
      apiKey: 'test-key'
    })

    const mockResponse = {
      content: [{ text: 'tag1, tag2, tag3' }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await suggestTags('test content')
    expect(result).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should limit to maximum 5 tags', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'tag1, tag2, tag3, tag4, tag5, tag6' } }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await suggestTags('test content')
    expect(result).toHaveLength(5)
  })

  it('should include existing tags in the prompt', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'newtag' } }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    await suggestTags('test content', ['existing1', 'existing2'])
    
    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)
    expect(body.messages[0].content).toContain('已有标签：existing1, existing2')
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API error'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await suggestTags('test content')
    expect(result).toEqual([])
    consoleErrorSpy.mockRestore()
  })
})
