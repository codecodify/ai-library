import { createClient } from '@/lib/supabase/server'
import { getUserSettings } from '@/lib/db/queries'
import { saveSettings } from '@/app/actions'
import { AIServiceConfig } from '@/components/settings/ai-service-config'
import { PlatformManager } from '@/components/settings/platform-manager'
import { ResourceTypeManager } from '@/components/settings/resource-type-manager'
import type { PlatformData, ResourceTypeData } from '@/types/resource'

export default async function SettingsPage() {
  const supabase = await createClient()
  const settings = await getUserSettings(supabase)
  
  const { data: platforms } = await supabase
    .from('platforms')
    .select('*')
    .order('sort_order', { ascending: true })
  
  const { data: resourceTypes } = await supabase
    .from('resource_types')
    .select('*')
    .order('sort_order', { ascending: true })
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">设置</h1>
      
      <form action={saveSettings} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">排序偏好</h2>
            <p className="text-sm text-gray-500 mt-1">设置资源列表的默认排序方式</p>
          </div>
          <div className="p-6">
            <select
              name="default_sort"
              defaultValue={settings?.default_sort || 'updated_at'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updated_at">最后更新</option>
              <option value="created_at">创建时间</option>
              <option value="copy_count">复制次数</option>
              <option value="title">标题</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">AI 服务配置</h2>
            <p className="text-sm text-gray-500 mt-1">配置 AI 服务以启用智能功能</p>
          </div>
          <div className="p-6">
            <AIServiceConfig
              defaultPlatform={settings?.default_platform || ''}
              apiBaseUrl={settings?.api_base_url || ''}
              openaiApiKey={settings?.openai_api_key || ''}
              anthropicApiKey={settings?.anthropic_api_key || ''}
              openrouterApiKey={settings?.openrouter_api_key || ''}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <ResourceTypeManager resourceTypes={(resourceTypes as ResourceTypeData[]) || []} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <PlatformManager platforms={(platforms as PlatformData[]) || []} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">数据管理</h2>
            <p className="text-sm text-gray-500 mt-1">导入或导出您的资源数据</p>
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <button type="button" className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                导出所有资源
              </button>
              <button type="button" className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                导入资源
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            保存设置
          </button>
        </div>
      </form>
    </div>
  )
}
