import { createClient } from '@/lib/supabase/server'
import type { Resource, Variant, Tag, ResourceWithTags, ResourceType, ResourceStatus, Platform } from '@/types/resource'

export async function createResource(data: {
  slug: string
  title: string
  type: ResourceType
  summary?: string | null
  description?: string | null
  content?: string | null
  source_url?: string | null
  status?: ResourceStatus
}): Promise<Resource> {
  const supabase = await createClient()
  
  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      slug: data.slug,
      title: data.title,
      type: data.type,
      summary: data.summary ?? null,
      description: data.description ?? null,
      content: data.content ?? null,
      source_url: data.source_url ?? null,
      status: data.status ?? 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return resource
}

export async function updateResource(
  id: string,
  data: Partial<{
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
  }>
): Promise<Resource> {
  const supabase = await createClient()
  
  const { data: resource, error } = await supabase
    .from('resources')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return resource
}

export async function deleteResource(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getResourceBySlug(slug: string): Promise<ResourceWithTags | null> {
  const supabase = await createClient()
  
  const { data: resource, error } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const { data: tags } = await supabase
    .from('resource_tags')
    .select(`
      tag:tags (
        id,
        name,
        created_at
      )
    `)
    .eq('resource_id', resource.id)

  const { data: variants } = await supabase
    .from('variants')
    .select('*')
    .eq('resource_id', resource.id)

  return {
    ...resource,
    tags: tags?.map(t => t.tag).filter(Boolean) || [],
    variants: variants || [],
  }
}

export async function listResources(options?: {
  type?: ResourceType
  status?: ResourceStatus
  limit?: number
  offset?: number
}): Promise<Resource[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function searchResources(searchTerm: string): Promise<Resource[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createVariant(data: {
  resource_id: string
  platform: Platform
  content?: string | null
}): Promise<Variant> {
  const supabase = await createClient()
  
  const { data: variant, error } = await supabase
    .from('variants')
    .insert({
      resource_id: data.resource_id,
      platform: data.platform,
      content: data.content ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return variant
}

export async function updateVariant(
  id: string,
  data: Partial<{
    platform: Platform
    content: string | null
  }>
): Promise<Variant> {
  const supabase = await createClient()
  
  const { data: variant, error } = await supabase
    .from('variants')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return variant
}

export async function deleteVariant(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('variants')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function listTags(): Promise<Tag[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createTag(name: string): Promise<Tag> {
  const supabase = await createClient()
  
  const { data: tag, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return tag
}

export async function logViewEvent(resourceId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('events')
    .insert({
      resource_id: resourceId,
      event_type: 'view',
    })

  if (error) throw error

  await supabase
    .from('resources')
    .update({ last_viewed_at: new Date().toISOString() })
    .eq('id', resourceId)
}

export async function logCopyEvent(resourceId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('events')
    .insert({
      resource_id: resourceId,
      event_type: 'copy',
    })

  if (error) throw error

  await supabase.rpc('increment_copy_count', { row_id: resourceId })

  await supabase
    .from('resources')
    .update({ last_copied_at: new Date().toISOString() })
    .eq('id', resourceId)
}

export async function getUserSettings(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error getting user settings:', error)
    return null
  }
  
  return data
}

export async function saveUserSettings(supabase: any, settings: {
  default_sort?: string
  default_platform?: string
  openai_api_key?: string
  anthropic_api_key?: string
  openrouter_api_key?: string
  api_base_url?: string
  selected_platform?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (existing) {
    const { error } = await supabase
      .from('user_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
    
    return { error }
  } else {
    const { error } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        ...settings,
      })
    
    return { error }
  }
}
