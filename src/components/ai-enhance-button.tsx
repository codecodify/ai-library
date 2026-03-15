'use client'

import { useState } from 'react'

interface AIEnhanceButtonProps {
  type: 'summary' | 'tags' | 'variant'
  content: string
  onResult: (result: string) => void
  platform?: string
}

export function AIEnhanceButton({ type, content, onResult, platform }: AIEnhanceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleClick = async () => {
    if (!content) {
      setError('请先输入内容')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      let endpoint = '/api/ai/'
      let body: Record<string, unknown> = { content }
      
      if (type === 'tags') {
        endpoint += 'tags'
      } else if (type === 'variant') {
        endpoint += 'variant'
        body.platform = platform
      } else {
        endpoint += 'summary'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else if (type === 'summary' && data.summary) {
        onResult(data.summary)
      } else if (type === 'tags' && data.tags) {
        onResult(data.tags.join(', '))
      } else if (type === 'variant' && data.content) {
        onResult(data.content)
      }
    } catch (err) {
      setError('请求失败')
    } finally {
      setLoading(false)
    }
  }
  
  const labels = {
    summary: 'AI 摘要',
    tags: 'AI 标签',
    variant: 'AI 转换',
  }
  
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
      >
        {loading ? '生成中...' : labels[type]}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
