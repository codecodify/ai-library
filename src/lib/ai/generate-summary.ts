import { getAIConfig } from './config'

export async function generateSummary(content: string): Promise<string | null> {
  const config = getAIConfig()
  
  if (!config) {
    console.log('AI not configured, skipping summary generation')
    return null
  }
  
  const prompt = `请为以下内容生成一个简洁的摘要（不超过100字）：

${content}

摘要：`

  try {
    let response
    
    if (config.provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
        }),
      })
      
      const data = await response.json()
      return data.choices?.[0]?.message?.content?.trim() || null
    }
    
    if (config.provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      
      const data = await response.json()
      return data.content?.[0]?.text?.trim() || null
    }
    
    return null
  } catch (error) {
    console.error('Error generating summary:', error)
    return null
  }
}
