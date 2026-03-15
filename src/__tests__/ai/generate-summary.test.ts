import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateSummary } from '@/lib/ai/generate-summary'
import * as config from '@/lib/ai/config'

vi.mock('@/lib/ai/config')

describe('generateSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should return null when AI is not configured', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue(null)
    const result = await generateSummary('test content')
    expect(result).toBeNull()
  })

  it('should generate summary with OpenAI provider', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    const mockResponse = {
      choices: [{ message: { content: 'Test summary' } }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await generateSummary('test content')
    expect(result).toBe('Test summary')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        })
      })
    )
  })

  it('should generate summary with Anthropic provider', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'anthropic',
      apiKey: 'test-key'
    })

    const mockResponse = {
      content: [{ text: 'Test summary' }]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response)

    const result = await generateSummary('test content')
    expect(result).toBe('Test summary')
  })

  it('should return null when API response is invalid', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => ({})
    } as Response)

    const result = await generateSummary('test content')
    expect(result).toBeNull()
  })

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(config.getAIConfig).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key'
    })

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await generateSummary('test content')
    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
