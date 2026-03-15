'use client'

import { useState } from 'react'
import { Variant, Platform } from '@/types/resource'
import { MarkdownContent } from '@/components/markdown-content'

interface VariantTabsProps {
  content: string | null
  variants: Variant[]
  resourceId: string
}

const PLATFORM_LABELS: Record<Platform, string> = {
  chatgpt: 'ChatGPT',
  cursor: 'Cursor',
  claude: 'Claude',
  dify: 'Dify',
  coze: 'Coze',
  notion: 'Notion',
  generic: '通用',
}

export function VariantTabs({ content, variants, resourceId }: VariantTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('main')
  const [copied, setCopied] = useState(false)
  
  const tabs = [
    { id: 'main', label: '主内容', content: content },
    ...variants.map(v => ({
      id: v.id,
      label: PLATFORM_LABELS[v.platform as Platform] || v.platform,
      content: v.content,
    }))
  ]
  
  const activeContent = tabs.find(t => t.id === activeTab)?.content || ''
  
  const handleCopy = async () => {
    if (!activeContent) return
    
    await navigator.clipboard.writeText(activeContent)
    
    await fetch('/api/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId }),
    })
    
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="min-h-[200px]">
        {activeContent ? (
          <div className="relative">
            <MarkdownContent content={activeContent} />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            暂无内容
          </div>
        )}
      </div>
    </div>
  )
}
