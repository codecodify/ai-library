'use client'

import type { PlatformData } from '@/types/resource'

interface PlatformSelectorProps {
  platforms: PlatformData[]
  selectedPlatforms: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformSelector({ platforms, selectedPlatforms, onChange }: PlatformSelectorProps) {
  const togglePlatform = (slug: string) => {
    if (selectedPlatforms.includes(slug)) {
      onChange(selectedPlatforms.filter(p => p !== slug))
    } else {
      onChange([...selectedPlatforms, slug])
    }
  }

  const selectAll = () => {
    onChange(platforms.map(p => p.slug))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          支持平台
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            全选
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            清除
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => togglePlatform(platform.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedPlatforms.includes(platform.slug)
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {platform.icon && <span>{platform.icon}</span>}
            <span>{platform.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        选择该资源支持的平台，创建后将自动为每个平台生成变体
      </p>
    </div>
  )
}
