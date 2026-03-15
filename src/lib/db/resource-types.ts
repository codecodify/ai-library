import { createClient } from '@/lib/supabase/server'
import type { ResourceTypeData } from '@/types/resource'

export async function getResourceTypes(): Promise<ResourceTypeData[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('resource_types')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching resource types:', error)
    return []
  }
  
  return data || []
}

export async function createResourceType(resourceType: {
  name: string
  slug: string
  icon?: string
  description?: string
  is_default?: boolean
  sort_order?: number
}): Promise<ResourceTypeData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('resource_types')
    .insert(resourceType)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating resource type:', error)
    return null
  }
  
  return data
}

export async function updateResourceType(
  id: string,
  data: Partial<{
    name: string
    icon: string
    description: string
    is_default: boolean
    sort_order: number
  }>
): Promise<ResourceTypeData | null> {
  const supabase = await createClient()
  
  const { data: resourceType, error } = await supabase
    .from('resource_types')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating resource type:', error)
    return null
  }
  
  return resourceType
}

export async function deleteResourceType(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: resources } = await supabase
    .from('resources')
    .select('id')
    .eq('type', id)
    .limit(1)
  
  if (resources && resources.length > 0) {
    return { success: false, error: '该资源类型已被资源使用，无法删除' }
  }
  
  const { error } = await supabase
    .from('resource_types')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting resource type:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function getResourceTypeBySlug(slug: string): Promise<ResourceTypeData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('resource_types')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching resource type:', error)
    return null
  }
  
  return data
}
