import { getAIConfig } from './config'
import { Platform } from '@/types/resource'

export async function generateVariant(
  content: string,
  targetPlatform: Platform
): Promise<string | null> {
  const config = getAIConfig()
  
  if (!config) {
    return null
  }
  
  const platformInstructions: Record<Platform, string> = {
    chatgpt: '转换为 ChatGPT 的指令格式，确保可以直接复制到 ChatGPT 使用',
    cursor: '转换为 Cursor 的 Agent 格式，包含清晰的上下文和指令',
    claude: '转换为 Claude 的指令格式，优化 Claude 的对话体验',
    dify: '转换为 Dify 工作流的 JSON 格式',
    coze: '转换为 Coze Bot 的配置格式',
    notion: '转换为 Notion 的说明文档格式',
    generic: '转换为通用的指令格式',
  }
  
  const prompt = `请将以下内容${platformInstructions[targetPlatform]}：

原始内容：
${content}

转换后的内容：`

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
          max_tokens: 2000,
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
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      
      const data = await response.json()
      return data.content?.[0]?.text?.trim() || null
    }
    
    return null
  } catch (error) {
    console.error('Error generating variant:', error)
    return null
  }
}
