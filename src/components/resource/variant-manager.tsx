'use client'

import { useState, useEffect } from 'react'
import { createVariant, updateVariant, deleteVariant } from '@/app/actions'
import { Variant, PlatformData } from '@/types/resource'

interface VariantManagerProps {
  resourceId: string
  variants: Variant[]
  platforms: PlatformData[]
}

export function VariantManager({ resourceId, variants, platforms: initialPlatforms }: VariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [platforms, setPlatforms] = useState<PlatformData[]>(initialPlatforms)
  
  useEffect(() => {
    fetch('/api/platforms')
      .then(res => res.json())
      .then(data => setPlatforms(data))
      .catch(console.error)
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">平台版本</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + 添加版本
        </button>
      </div>
      
      {isAdding && (
        <form
          action={async (formData) => {
            formData.set('resource_id', resourceId)
            await createVariant(formData)
            setIsAdding(false)
          }}
          className="bg-gray-50 p-4 rounded-lg space-y-3"
        >
          <select
            name="platform"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">选择平台</option>
            {platforms.map(p => (
              <option key={p.id} value={p.slug}>{p.icon ? `${p.icon} ` : ''}{p.name}</option>
            ))}
          </select>
          <textarea
            name="content"
            placeholder="平台特定内容..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 border border-gray-300 text-sm rounded"
            >
              取消
            </button>
          </div>
        </form>
      )}
      
      {variants.map((variant) => (
        <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
          {editingId === variant.id ? (
            <form
              action={async (formData) => {
                await updateVariant(variant.id, formData)
                setEditingId(null)
              }}
              className="space-y-3"
            >
              <select
                name="platform"
                defaultValue={variant.platform}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {platforms.map(p => (
                  <option key={p.id} value={p.slug}>{p.icon ? `${p.icon} ` : ''}{p.name}</option>
                ))}
              </select>
              <textarea
                name="content"
                defaultValue={variant.content || ''}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 border border-gray-300 text-sm rounded"
                >
                  取消
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {platforms.find(p => p.slug === variant.platform)?.icon && (
                    <span className="mr-1">{platforms.find(p => p.slug === variant.platform)?.icon}</span>
                  )}
                  {platforms.find(p => p.slug === variant.platform)?.name || variant.platform}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(variant.id)}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    编辑
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('确定删除这个版本？')) {
                        await deleteVariant(variant.id)
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                {variant.content || '(无内容)'}
              </pre>
            </div>
          )}
        </div>
      ))}
      
      {variants.length === 0 && !isAdding && (
        <p className="text-gray-500 text-sm">暂无平台版本</p>
      )}
    </div>
  )
}
