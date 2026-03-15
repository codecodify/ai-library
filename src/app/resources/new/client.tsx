'use client'

import { createResourceWithVariants } from '@/app/actions'
import { AIEnhanceButton } from '@/components/ai-enhance-button'
import { PlatformSelector } from '@/components/platform-selector'
import { useState } from 'react'
import type { PlatformData, ResourceTypeData } from '@/types/resource'

interface NewResourcePageClientProps {
  platforms: PlatformData[]
  resourceTypes: ResourceTypeData[]
}

export default function NewResourcePageClient({ platforms, resourceTypes }: NewResourcePageClientProps) {
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    platforms.filter(p => p.is_default).map(p => p.slug)
  )

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新增资源</h1>
      
      <form action={createResourceWithVariants} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名称 *
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类型 *
          </label>
          <select
            name="type"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {resourceTypes.map(rt => (
              <option key={rt.id} value={rt.slug}>
                {rt.icon ? `${rt.icon} ` : ''}{rt.name}
              </option>
            ))}
          </select>
        </div>

        <PlatformSelector
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
        
        {selectedPlatforms.map(slug => (
          <input key={slug} type="hidden" name="platforms" value={slug} />
        ))}
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              简介
            </label>
            <AIEnhanceButton
              type="summary"
              content={content}
              onResult={(result) => setSummary(result)}
            />
          </div>
          <input
            type="text"
            name="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            详细说明
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            主内容
          </label>
          <textarea
            name="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              标签（用逗号分隔）
            </label>
            <AIEnhanceButton
              type="tags"
              content={content}
              onResult={(result) => setTags(result)}
            />
          </div>
          <input
            type="text"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, productivity, coding"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            来源链接
          </label>
          <input
            type="url"
            name="source_url"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            状态
          </label>
          <select
            name="status"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建
          </button>
          <a
            href="/resources"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </a>
        </div>
      </form>
    </div>
  )
}
