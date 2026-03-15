'use client'

import { useState } from 'react'

const API_PRESETS: Record<string, { name: string; baseUrl: string }> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com/v1beta',
  },
  gemini: {
    name: 'Google (Gemini)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
  },
  custom: {
    name: '自定义',
    baseUrl: '',
  },
}

interface AIServiceConfigProps {
  defaultPlatform?: string
  apiBaseUrl?: string
  openaiApiKey?: string
  anthropicApiKey?: string
  openrouterApiKey?: string
}

export function AIServiceConfig({
  defaultPlatform = '',
  apiBaseUrl = '',
  openaiApiKey = '',
  anthropicApiKey = '',
  openrouterApiKey = '',
}: AIServiceConfigProps) {
  const [selectedPlatform, setSelectedPlatform] = useState(defaultPlatform || 'openai')
  const [isCustomUrl, setIsCustomUrl] = useState(!defaultPlatform || defaultPlatform === 'custom' || !API_PRESETS[defaultPlatform])
  const [currentBaseUrl, setCurrentBaseUrl] = useState(apiBaseUrl || API_PRESETS['openai'].baseUrl)

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform)
    if (platform === 'custom') {
      setIsCustomUrl(true)
      setCurrentBaseUrl('')
    } else {
      setIsCustomUrl(false)
      setCurrentBaseUrl(API_PRESETS[platform]?.baseUrl || '')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700">
          💡 配置 AI 服务以启用自动生成摘要和标签功能。选择预设平台会自动填充 API Base URL。
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            AI 服务商
          </label>
          <select
            name="selected_platform"
            value={selectedPlatform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {Object.entries(API_PRESETS).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            API Base URL
          </label>
          {isCustomUrl ? (
            <input
              type="url"
              name="api_base_url"
              value={currentBaseUrl}
              onChange={(e) => setCurrentBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                name="api_base_url"
                value={currentBaseUrl}
                readOnly
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomUrl(true)
                  setSelectedPlatform('custom')
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                自定义
              </button>
            </div>
          )}
          <p className="mt-1.5 text-xs text-gray-500">
            {selectedPlatform === 'openai' && 'OpenAI 官方 API 地址，也兼容 Azure OpenAI'}
            {selectedPlatform === 'anthropic' && 'Anthropic Claude API 地址'}
            {selectedPlatform === 'gemini' && 'Google Generative AI (Gemini) API 地址'}
            {selectedPlatform === 'openrouter' && 'OpenRouter 统一 API 地址'}
            {selectedPlatform === 'custom' && '输入自定义 API Base URL'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            API Key
          </label>
          <input
            type="password"
            name="api_key"
            defaultValue={
              selectedPlatform === 'openai' ? openaiApiKey :
              selectedPlatform === 'anthropic' ? anthropicApiKey :
              selectedPlatform === 'openrouter' ? openrouterApiKey : ''
            }
            placeholder={
              selectedPlatform === 'openai' ? 'sk-...' :
              selectedPlatform === 'anthropic' ? 'sk-ant-...' :
              selectedPlatform === 'gemini' ? 'AIza...' :
              selectedPlatform === 'openrouter' ? 'sk-or-...' : '输入 API Key'
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            您的 API Key 将被安全存储，仅用于调用 AI 服务
          </p>
        </div>
      </div>

      <input type="hidden" name="default_platform" value={selectedPlatform} />
      <input type="hidden" name="api_base_url" value={currentBaseUrl} />
      
      {selectedPlatform === 'openai' && (
        <input type="hidden" name="openai_api_key" defaultValue={openaiApiKey} />
      )}
      {selectedPlatform === 'anthropic' && (
        <input type="hidden" name="anthropic_api_key" defaultValue={anthropicApiKey} />
      )}
      {selectedPlatform === 'openrouter' && (
        <input type="hidden" name="openrouter_api_key" defaultValue={openrouterApiKey} />
      )}
    </div>
  )
}
