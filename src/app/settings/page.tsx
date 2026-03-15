import { createClient } from '@/lib/supabase/server'
import { getUserSettings } from '@/lib/db/queries'
import { saveSettings } from '@/app/actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const settings = await getUserSettings(supabase)
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">设置</h1>
      
      <form action={saveSettings} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">默认排序</h2>
            <select
              name="default_sort"
              defaultValue={settings?.default_sort || 'updated_at'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="updated_at">最后更新</option>
              <option value="created_at">创建时间</option>
              <option value="copy_count">复制次数</option>
              <option value="title">标题</option>
            </select>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">默认平台</h2>
            <select
              name="default_platform"
              defaultValue={settings?.default_platform || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部平台</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="cursor">Cursor</option>
              <option value="claude">Claude</option>
              <option value="dify">Dify</option>
              <option value="coze">Coze</option>
              <option value="notion">Notion</option>
              <option value="generic">通用</option>
            </select>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI 服务配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  name="openai_api_key"
                  defaultValue={settings?.openai_api_key || ''}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  name="anthropic_api_key"
                  defaultValue={settings?.anthropic_api_key || ''}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  name="openrouter_api_key"
                  defaultValue={settings?.openrouter_api_key || ''}
                  placeholder="sk-or-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <p className="text-sm text-gray-500">
                用于自动生成摘要和标签。可选配置，不配置则不启用 AI 功能。
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">导入导出</h2>
            <div className="flex gap-4">
              <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                导出所有资源
              </button>
              <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                导入资源
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存设置
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
