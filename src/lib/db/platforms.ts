import { createClient } from '@/lib/supabase/server'
import type { PlatformData } from '@/types/resource'

export async function getPlatforms(): Promise<PlatformData[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching platforms:', error)
    return []
  }
  
  return data || []
}

export async function createPlatform(platform: {
  name: string
  slug: string
  icon?: string
  is_default?: boolean
  sort_order?: number
}): Promise<PlatformData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platforms')
    .insert(platform)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating platform:', error)
    return null
  }
  
  return data
}

export async function updatePlatform(
  id: string,
  data: Partial<{
    name: string
    icon: string
    is_default: boolean
    sort_order: number
  }>
): Promise<PlatformData | null> {
  const supabase = await createClient()
  
  const { data: platform, error } = await supabase
    .from('platforms')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating platform:', error)
    return null
  }
  
  return platform
}

export async function deletePlatform(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: variants } = await supabase
    .from('variants')
    .select('id')
    .eq('platform', id)
    .limit(1)
  
  if (variants && variants.length > 0) {
    return { success: false, error: '该平台已被资源使用，无法删除' }
  }
  
  const { error } = await supabase
    .from('platforms')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting platform:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function getPlatformBySlug(slug: string): Promise<PlatformData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching platform:', error)
    return null
  }
  
  return data
}
