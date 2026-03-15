import { notFound } from 'next/navigation'
import { updateResource, deleteResource } from '@/app/actions'
import { createClient } from '@/lib/supabase/server'
import { VariantManager } from '@/components/resource/variant-manager'
import { AIEnhanceButton } from '@/components/ai-enhance-button'
import { useState } from 'react'

export default async function EditResourcePage({
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

  const deleteAction = deleteResource.bind(null, resource.id)
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑资源</h1>
      
      <form action={updateResource.bind(null, resource.id)} className="space-y-6">
        <input type="hidden" name="slug" value={resource.slug} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名称 *
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={resource.title}
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
            defaultValue={resource.slug}
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
            defaultValue={resource.type}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="agent">Agent</option>
            <option value="skill">Skill</option>
            <option value="prompt">Prompt</option>
            <option value="workflow">Workflow</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            简介
          </label>
          <input
            type="text"
            name="summary"
            defaultValue={resource.summary || ''}
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
            defaultValue={resource.description || ''}
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
            defaultValue={resource.content || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            来源链接
          </label>
          <input
            type="url"
            name="source_url"
            defaultValue={resource.source_url || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            状态
          </label>
          <select
            name="status"
            defaultValue={resource.status}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_favorite"
              value="true"
              defaultChecked={resource.is_favorite}
              className="rounded"
            />
            <span className="text-sm text-gray-700">收藏</span>
          </label>
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            保存
          </button>
          <a
            href={`/resources/${slug}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </a>
          <button
            type="submit"
            formAction={deleteAction}
            onClick={(e) => {
              if (!confirm('确定要删除这个资源吗？')) {
                e.preventDefault()
              }
            }}
            className="px-6 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </form>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <VariantManager resourceId={resource.id} variants={variants || []} />
      </div>
    </div>
  )
}
