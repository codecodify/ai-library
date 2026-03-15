'use client'

interface SortSelectProps {
  defaultValue: string
}

export function SortSelect({ defaultValue }: SortSelectProps) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => {
        const url = new URL(window.location.href)
        if (e.target.value === 'updated') {
          url.searchParams.delete('sort')
        } else {
          url.searchParams.set('sort', e.target.value)
        }
        window.location.href = url.toString()
      }}
      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
    >
      <option value="updated">最近更新</option>
      <option value="created">创建时间</option>
      <option value="copies">复制次数</option>
      <option value="views">最近查看</option>
    </select>
  )
}
