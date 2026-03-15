import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface SearchParams {
  q?: string
  type?: string
  platform?: string
  tag?: string
  favorite?: string
  sort?: string
}

const PLATFORMS = ['chatgpt', 'cursor', 'claude', 'dify', 'coze', 'notion', 'generic']

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // 获取所有标签
  const { data: allTags } = await supabase.from('tags').select('*').order('name')
  
  // 获取所有平台及其资源数量
  const { data: allVariants } = await supabase.from('variants').select('resource_id, platform')
  const platformCounts = PLATFORMS.reduce((acc, p) => {
    acc[p] = allVariants?.filter(v => v.platform === p).length || 0
    return acc
  }, {} as Record<string, number>)
  
  let query = supabase.from('resources').select(`
    *,
    resource_tags (
      tags (
        id,
        name
      )
    )
  `)
  
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,summary.ilike.%${params.q}%,content.ilike.%${params.q}%`)
  }
  if (params.type) {
    query = query.eq('type', params.type)
  }
  if (params.favorite === 'true') {
    query = query.eq('is_favorite', true)
  }
  
  // 排序
  if (params.sort === 'copies') {
    query = query.order('copy_count', { ascending: false })
  } else if (params.sort === 'views') {
    query = query.order('last_viewed_at', { ascending: false })
  } else {
    query = query.order('updated_at', { ascending: false })
  }
  
  const { data: resources } = await query
  
  // 过滤有平台关联的资源
  let filteredResources = resources || []
  if (params.platform) {
    const platformList = params.platform.split(',')
    const platformResourceIds = allVariants
      ?.filter(v => platformList.includes(v.platform))
      .map(v => v.resource_id) || []
    filteredResources = filteredResources.filter(r => platformResourceIds.includes(r.id))
  }
  
  // 过滤有标签关联的资源
  if (params.tag) {
    const tagList = params.tag.split(',')
    filteredResources = filteredResources.filter(r => 
      r.resource_tags?.some((rt: any) => tagList.includes(rt.tags?.name))
    )
  }
  
  const getTags = (resource: any) => {
    return resource.resource_tags?.map((rt: any) => rt.tags).flat().filter(Boolean) || []
  }
  
  const getPlatformCount = (resourceId: string) => {
    return allVariants?.filter(v => v.resource_id === resourceId).length || 0
  }

  // 构建筛选URL的辅助函数
  const buildFilterUrl = (key: string, value: string) => {
    const newParams = new URLSearchParams()
    if (params.q) newParams.set('q', params.q)
    if (params.type) newParams.set('type', params.type)
    if (params.sort) newParams.set('sort', params.sort)
    if (params.favorite) newParams.set('favorite', params.favorite)
    
    if (key === 'platform') {
      const current = params.platform?.split(',').filter(Boolean) || []
      if (current.includes(value)) {
        const filtered = current.filter((p: string) => p !== value)
        if (filtered.length > 0) newParams.set('platform', filtered.join(','))
      } else {
        newParams.set('platform', [...current, value].join(','))
      }
    } else if (key === 'tag') {
      const current = params.tag?.split(',').filter(Boolean) || []
      if (current.includes(value)) {
        const filtered = current.filter((t: string) => t !== value)
        if (filtered.length > 0) newParams.set('tag', filtered.join(','))
      } else {
        newParams.set('tag', [...current, value].join(','))
      }
    }
    
    return `/resources?${newParams.toString()}`
  }

  const clearFilters = () => '/resources'

  return (
    <div className="flex gap-8">
      {/* 左侧筛选 */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">筛选</h3>
            {(params.platform || params.tag || params.type || params.favorite) && (
              <Link href={clearFilters()} className="text-xs text-blue-600 hover:underline">
                清除筛选
              </Link>
            )}
          </div>
          
          {/* 类型筛选 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">类型</h4>
            <div className="space-y-1">
              {['agent', 'skill', 'prompt', 'workflow'].map((type) => (
                <Link
                  key={type}
                  href={params.type === type ? '/resources' : `/resources?type=${type}`}
                  className={`block text-sm py-1 ${params.type === type ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                >
                  {type === 'agent' ? 'Agent' : type === 'skill' ? 'Skill' : type === 'prompt' ? 'Prompt' : 'Workflow'}
                </Link>
              ))}
            </div>
          </div>
          
          {/* 平台筛选 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">平台</h4>
            <div className="space-y-1">
              {PLATFORMS.map((platform) => (
                <Link
                  key={platform}
                  href={buildFilterUrl('platform', platform)}
                  className={`block text-sm py-1 flex items-center justify-between ${
                    params.platform?.split(',').includes(platform) ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  <span className="capitalize">{platform}</span>
                  <span className="text-xs text-gray-400">({platformCounts[platform] || 0})</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* 标签筛选 */}
          {allTags && allTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">标签</h4>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={buildFilterUrl('tag', tag.name)}
                    className={`px-2 py-0.5 text-xs rounded ${
                      params.tag?.split(',').includes(tag.name) 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* 收藏筛选 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">收藏</h4>
            <Link
              href={params.favorite === 'true' ? '/resources' : '/resources?favorite=true'}
              className={`block text-sm py-1 ${params.favorite === 'true' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              ★ 已收藏
            </Link>
          </div>
          
          {/* 排序 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">排序</h4>
            <select
              defaultValue={params.sort || 'updated'}
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
          </div>
        </div>
      </aside>
      
      {/* 右侧列表 */}
      <div className="flex-1">
        {/* 搜索和排序 */}
        <div className="flex justify-between items-center mb-6">
          <form action="/resources" method="GET" className="flex-1 max-w-md">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder="搜索资源..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
          <Link
            href="/resources/new"
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            新增资源
          </Link>
        </div>
        
        {/* 资源列表 */}
        {filteredResources.length > 0 ? (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.slug}`}
                className="block bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                        {resource.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getPlatformCount(resource.id)} 个平台版本
                      </span>
                      {resource.is_favorite && (
                        <span className="text-yellow-500">★</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {resource.summary || resource.description || '暂无描述'}
                    </p>
                    {getTags(resource).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {getTags(resource).map((tag: any) => (
                          <span key={tag.id} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      更新于 {new Date(resource.updated_at).toLocaleDateString('zh-CN')}
                      {' · '}
                      复制 {resource.copy_count} 次
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">暂无资源</p>
            <Link
              href="/resources/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              创建第一个资源
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
