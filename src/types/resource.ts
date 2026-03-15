export type ResourceType = 'agent' | 'skill' | 'prompt' | 'workflow'
export type ResourceStatus = 'draft' | 'published' | 'archived'
export type Platform = 'chatgpt' | 'cursor' | 'claude' | 'dify' | 'coze' | 'notion' | 'generic'

export interface Resource {
  id: string
  slug: string
  title: string
  type: ResourceType
  summary: string | null
  description: string | null
  content: string | null
  source_url: string | null
  status: ResourceStatus
  is_favorite: boolean
  copy_count: number
  last_copied_at: string | null
  last_viewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface ResourceTag {
  resource_id: string
  tag_id: string
}

export interface Variant {
  id: string
  resource_id: string
  platform: Platform
  content: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  resource_id: string
  event_type: 'view' | 'copy'
  created_at: string
}

export interface ResourceWithTags extends Resource {
  tags: Tag[]
  variants: Variant[]
}
