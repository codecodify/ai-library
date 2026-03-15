import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SortSelect } from '@/components/resource/sort-select'
import type { PlatformData, ResourceTypeData } from '@/types/resource'

interface SearchParams {
  q?: string
  type?: string
  platform?: string
  tag?: string
  favorite?: string
  sort?: string
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // 获取所有标签
  const { data: allTags } = await supabase.from('tags').select('*').order('name')
  
  // 获取所有平台
  const { data: platforms } = await supabase
    .from('platforms')
    .select('*')
    .order('sort_order', { ascending: true })
  
  // 获取所有资源类型
  const { data: resourceTypes } = await supabase
    .from('resource_types')
    .select('*')
    .order('sort_order', { ascending: true })
  
  // 获取所有平台及其资源数量
  const { data: allVariants } = await supabase.from('variants').select('resource_id, platform')
  const platformCounts = (platforms || []).reduce((acc, p) => {
    acc[p.slug] = allVariants?.filter(v => v.platform === p.slug).length || 0
    return acc
  }, {} as Record<string, number>)
  
  // 获取所有资源类型及其资源数量
  const { data: allResources } = await supabase.from('resources').select('type')
  const typeCounts = (resourceTypes || []).reduce((acc, rt) => {
    acc[rt.slug] = allResources?.filter(r => r.type === rt.slug).length || 0
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
  
  const getTypeInfo = (typeSlug: string) => {
    return resourceTypes?.find(rt => rt.slug === typeSlug)
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
      <aside className="w-72 flex-shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6 sticky top-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg">筛选条件</h3>
            {(params.platform || params.tag || params.type || params.favorite) && (
              <Link href={clearFilters()} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors bg-blue-50 px-2 py-1 rounded-md">
                清除全部
              </Link>
            )}
          </div>
          
          {/* 类型筛选 */}
          {resourceTypes && resourceTypes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                资源类型
              </h4>
              <div className="space-y-1 pl-3">
                {resourceTypes.map((rt) => (
                  <Link
                    key={rt.id}
                    href={params.type === rt.slug ? '/resources' : `/resources?type=${rt.slug}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all no-underline ${
                      params.type === rt.slug 
                        ? 'bg-blue-500 text-white shadow-sm font-medium' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {rt.icon && <span>{rt.icon}</span>}
                      <span>{rt.name}</span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      params.type === rt.slug
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 bg-gray-100'
                    }`}>{typeCounts[rt.slug] || 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* 平台筛选 */}
          {platforms && platforms.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                支持平台
              </h4>
              <div className="space-y-1 pl-3">
                {platforms.map((platform) => (
                  <Link
                    key={platform.id}
                    href={buildFilterUrl('platform', platform.slug)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all no-underline ${
                      params.platform?.split(',').includes(platform.slug) 
                        ? 'bg-green-500 text-white shadow-sm font-medium' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {platform.icon && <span>{platform.icon}</span>}
                      <span>{platform.name}</span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      params.platform?.split(',').includes(platform.slug)
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 bg-gray-100'
                    }`}>{platformCounts[platform.slug] || 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* 标签筛选 */}
          {allTags && allTags.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                标签
              </h4>
              <div className="flex flex-wrap gap-2 pl-3">
                {allTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={buildFilterUrl('tag', tag.name)}
                    className={`px-3 py-1.5 text-xs rounded-full no-underline transition-all font-medium ${
                      params.tag?.split(',').includes(tag.name) 
                        ? 'bg-purple-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                    }`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* 收藏筛选 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              收藏状态
            </h4>
            <div className="pl-3">
              <Link
                href={params.favorite === 'true' ? '/resources' : '/resources?favorite=true'}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all no-underline ${
                  params.favorite === 'true' 
                    ? 'bg-yellow-500 text-white shadow-sm font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="text-base">⭐</span>
                <span>已收藏资源</span>
              </Link>
            </div>
          </div>
          
          {/* 排序 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
              排序方式
            </h4>
            <div className="pl-3">
              <SortSelect defaultValue={params.sort || 'updated'} />
            </div>
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
            className="ml-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            + 新增资源
          </Link>
        </div>
        
        {/* 资源列表 */}
        {filteredResources.length > 0 ? (
          <div className="space-y-4">
            {filteredResources.map((resource) => {
              const typeInfo = getTypeInfo(resource.type)
              return (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.slug}`}
                  className="block bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded flex items-center gap-1">
                          {typeInfo?.icon && <span>{typeInfo.icon}</span>}
                          {typeInfo?.name || resource.type}
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
              )
            })}
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
