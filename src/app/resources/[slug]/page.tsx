import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { VariantTabs } from '@/components/resource/variant-tabs'
import { ActionButtons } from '@/components/action-buttons'

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: resource } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (!resource) {
    notFound()
  }
  
  const { data: variants } = await supabase
    .from('variants')
    .select('*')
    .eq('resource_id', resource.id)
    .order('platform')
  
  const { data: resourceTags } = await supabase
    .from('resource_tags')
    .select('*, tags(*)')
    .eq('resource_id', resource.id)
  
  const tags = resourceTags?.map(rt => rt.tags).flat() || []
  
  await supabase
    .from('resources')
    .update({ last_viewed_at: new Date().toISOString() })
    .eq('id', resource.id)
  
  await supabase
    .from('events')
    .insert({ resource_id: resource.id, event_type: 'view' })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/resources" className="text-blue-600 hover:underline">
          ← 返回资源列表
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                {resource.type}
              </span>
              {resource.is_favorite && (
                <span className="text-yellow-500">★ 已收藏</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resource.title}
            </h1>
            {resource.summary && (
              <p className="text-lg text-gray-600">{resource.summary}</p>
            )}
          </div>
          <div className="flex gap-2">
            <ActionButtons 
              resourceId={resource.id} 
              isFavorite={resource.is_favorite}
              isFrequent={resource.is_frequent || false}
              slug={slug}
            />
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {resource.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">详细说明</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{resource.description}</p>
          </div>
        )}
        
        {variants && variants.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">内容</h2>
            <VariantTabs 
              content={resource.content} 
              variants={variants} 
              resourceId={resource.id}
            />
          </div>
        )}

        {(!variants || variants.length === 0) && resource.content && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">内容</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
              {resource.content}
            </pre>
          </div>
        )}
        
        {resource.source_url && (
          <div className="pt-6 border-t border-gray-200">
            <a
              href={resource.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              查看来源 →
            </a>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          创建于 {new Date(resource.created_at).toLocaleDateString('zh-CN')}
          {' · '}
          更新于 {new Date(resource.updated_at).toLocaleDateString('zh-CN')}
          {' · '}
          复制 {resource.copy_count} 次
        </div>
      </div>
    </div>
  )
}
