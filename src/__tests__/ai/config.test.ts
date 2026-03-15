import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAIConfig, isAIEnabled } from '@/lib/ai/config'

describe('AI Config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getAIConfig', () => {
    it('should return null when no API keys are set', () => {
      expect(getAIConfig()).toBeNull()
    })

    it('should return OpenAI config when OPENAI_API_KEY is set', () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
      const config = getAIConfig()
      expect(config).toEqual({
        provider: 'openai',
        apiKey: 'test-openai-key'
      })
    })

    it('should return Anthropic config when ANTHROPIC_API_KEY is set', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key')
      const config = getAIConfig()
      expect(config).toEqual({
        provider: 'anthropic',
        apiKey: 'test-anthropic-key'
      })
    })

    it('should return OpenRouter config when OPENROUTER_API_KEY is set', () => {
      vi.stubEnv('OPENROUTER_API_KEY', 'test-openrouter-key')
      const config = getAIConfig()
      expect(config).toEqual({
        provider: 'openrouter',
        apiKey: 'test-openrouter-key'
      })
    })

    it('should prioritize OpenAI over other providers', () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key')
      vi.stubEnv('OPENROUTER_API_KEY', 'test-openrouter-key')
      const config = getAIConfig()
      expect(config?.provider).toBe('openai')
    })
  })

  describe('isAIEnabled', () => {
    it('should return false when no API keys are set', () => {
      expect(isAIEnabled()).toBe(false)
    })

    it('should return true when OPENAI_API_KEY is set', () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-key')
      expect(isAIEnabled()).toBe(true)
    })
  })
})
