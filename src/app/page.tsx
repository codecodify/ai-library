import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FavoriteButton } from '@/components/favorite-button'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: recentResources } = await supabase
    .from('resources')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(6)

  const { data: favoriteResources } = await supabase
    .from('resources')
    .select('*')
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false })
    .limit(6)

  const { data: recentCopiedResources } = await supabase
    .from('resources')
    .select('*')
    .not('last_copied_at', 'is', null)
    .order('last_copied_at', { ascending: false })
    .limit(6)

  return (
    <div className="space-y-12">
      {/* 搜索区域 */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Agent / Skills 资源库
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          管理、检索、预览并快速复制 AI Agents / Skills
        </p>
        <form action="/resources" method="GET" className="max-w-2xl mx-auto">
          <input
            type="text"
            name="q"
            placeholder="搜索资源名称、标签、内容..."
            className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>
        
        {/* 快速筛选入口 */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Link
            href="/resources?type=agent"
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
          >
            Agents
          </Link>
          <Link
            href="/resources?type=skill"
            className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
          >
            Skills
          </Link>
          <Link
            href="/resources?type=prompt"
            className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200"
          >
            Prompts
          </Link>
          <Link
            href="/resources?type=workflow"
            className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200"
          >
            Workflows
          </Link>
          <Link
            href="/resources?favorite=true"
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
          >
            ★ 收藏
          </Link>
        </div>
      </div>

      {/* 最近复制 */}
      {recentCopiedResources && recentCopiedResources.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">最近复制</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCopiedResources.map((resource) => (
              <div
                key={resource.id}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                      {resource.type}
                    </span>
                    <FavoriteButton 
                      resourceId={resource.id} 
                      isFavorite={resource.is_favorite} 
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {resource.last_copied_at 
                      ? new Date(resource.last_copied_at).toLocaleDateString('zh-CN')
                      : ''}
                  </span>
                </div>
                <Link href={`/resources/${resource.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {resource.summary || resource.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 最近更新 */}
      {recentResources && recentResources.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">最近更新</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentResources.map((resource) => (
              <div
                key={resource.id}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                    {resource.type}
                  </span>
                  <FavoriteButton 
                    resourceId={resource.id} 
                    isFavorite={resource.is_favorite} 
                  />
                </div>
                <Link href={`/resources/${resource.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {resource.summary || resource.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 收藏资源 */}
      {favoriteResources && favoriteResources.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">我的收藏</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteResources.map((resource) => (
              <div
                key={resource.id}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                    {resource.type}
                  </span>
                  <FavoriteButton 
                    resourceId={resource.id} 
                    isFavorite={resource.is_favorite} 
                  />
                </div>
                <Link href={`/resources/${resource.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {resource.summary || resource.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {!recentResources?.length && !favoriteResources?.length && (
        <div className="text-center py-12">
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
  )
}
