import { createResource } from '@/app/actions'
import { AIEnhanceButton } from '@/components/ai-enhance-button'
import { useState } from 'react'

export default function NewResourcePage() {
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [variantContent, setVariantContent] = useState('')
  const [variantPlatform, setVariantPlatform] = useState('chatgpt')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新增资源</h1>
      
      <form action={createResource} className="space-y-6">
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
            <option value="agent">Agent</option>
            <option value="skill">Skill</option>
            <option value="prompt">Prompt</option>
            <option value="workflow">Workflow</option>
          </select>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              简介
            </label>
            <AIEnhanceButton
              type="summary"
              content={(document.querySelector('textarea[name="content"]') as HTMLTextAreaElement)?.value || ''}
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
              content={(document.querySelector('textarea[name="content"]') as HTMLTextAreaElement)?.value || ''}
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
