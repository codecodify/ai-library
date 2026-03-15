import { getAIConfig } from './config'

export async function suggestTags(content: string, existingTags: string[] = []): Promise<string[]> {
  const config = getAIConfig()
  
  if (!config) {
    console.log('AI not configured, skipping tag suggestion')
    return []
  }
  
  const existingStr = existingTags.length > 0 ? `\n已有标签：${existingTags.join(', ')}` : ''
  
  const prompt = `请根据以下内容建议 3-5 个标签（用逗号分隔）：
  
${content}
${existingStr}

标签建议：`

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
          max_tokens: 100,
        }),
      })
      
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content?.trim() || ''
      
      return text.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 5)
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
          max_tokens: 100,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      
      const data = await response.json()
      const text = data.content?.[0]?.text?.trim() || ''
      
      return text.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 5)
    }
    
    return []
  } catch (error) {
    console.error('Error suggesting tags:', error)
    return []
  }
}
