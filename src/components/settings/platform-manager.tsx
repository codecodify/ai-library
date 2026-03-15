'use client'

import { useState } from 'react'
import type { PlatformData } from '@/types/resource'

interface PlatformManagerProps {
  platforms: PlatformData[]
}

export function PlatformManager({ platforms: initialPlatforms }: PlatformManagerProps) {
  const [platforms, setPlatforms] = useState(initialPlatforms)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '' })
  const [error, setError] = useState('')

  const resetForm = () => {
    setFormData({ name: '', slug: '', icon: '' })
    setError('')
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.slug) {
      setError('名称和标识符不能为空')
      return
    }

    const res = await fetch('/api/platforms', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        icon: formData.icon || null,
        sort_order: platforms.length + 1,
      }),
    })

    if (res.ok) {
      const newPlatform = await res.json()
      setPlatforms([...platforms, newPlatform])
      setIsAdding(false)
      resetForm()
    } else {
      const data = await res.json()
      setError(data.error || '添加失败')
    }
  }

  const handleUpdate = async (id: string) => {
    const res = await fetch('/api/platforms', {
      method: 'PATCH',
      body: JSON.stringify({
        id,
        name: formData.name,
        icon: formData.icon || null,
      }),
    })

    if (res.ok) {
      const updatedPlatform = await res.json()
      setPlatforms(platforms.map(p => p.id === id ? updatedPlatform : p))
      setEditingId(null)
      resetForm()
    } else {
      const data = await res.json()
      setError(data.error || '更新失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此平台吗？')) return

    const res = await fetch('/api/platforms', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      setPlatforms(platforms.filter(p => p.id !== id))
    } else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  const startEdit = (platform: PlatformData) => {
    setEditingId(platform.id)
    setFormData({ name: platform.name, slug: platform.slug, icon: platform.icon || '' })
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">平台管理</h3>
        <button
          type="button"
          onClick={startAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 添加平台
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="ChatGPT"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">标识符 *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="chatgpt"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">图标</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="🤖"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); resetForm() }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
            {editingId === platform.id ? (
              <div className="flex-1 flex gap-3 items-center">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  placeholder="🤖"
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-xs text-gray-400">{platform.slug}</span>
                <button
                  type="button"
                  onClick={() => handleUpdate(platform.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); resetForm() }}
                  className="px-3 py-1 border border-gray-300 text-gray-600 rounded text-sm"
                >
                  取消
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{platform.icon || '📦'}</span>
                  <div>
                    <span className="font-medium text-gray-900">{platform.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{platform.slug}</span>
                    {platform.is_default && (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">默认</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(platform)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(platform.id)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {platforms.length === 0 && !isAdding && (
        <p className="text-center text-gray-500 py-8">暂无平台，点击上方按钮添加</p>
      )}
    </div>
  )
}
