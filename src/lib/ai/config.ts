export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'openrouter'
  apiKey: string
}

export function getAIConfig(): AIConfig | null {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    return null
  }
  
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey }
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', apiKey }
  }
  
  return { provider: 'openrouter', apiKey: process.env.OPENROUTER_API_KEY! }
}

export function isAIEnabled(): boolean {
  return getAIConfig() !== null
}
