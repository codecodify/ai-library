'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { saveUserSettings } from '@/lib/db/queries'

export async function createResource(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const type = formData.get('type') as string
  const summary = formData.get('summary') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const source_url = formData.get('source_url') as string
  const status = formData.get('status') as string || 'published'
  
  const { data, error } = await supabase
    .from('resources')
    .insert({
      title,
      slug,
      type,
      summary,
      description,
      content,
      source_url,
      status,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating resource:', error)
    return { error: error.message }
  }
  
  revalidatePath('/resources')
  revalidatePath('/')
  redirect(`/resources/${slug}`)
}

export async function updateResource(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const type = formData.get('type') as string
  const summary = formData.get('summary') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const source_url = formData.get('source_url') as string
  const status = formData.get('status') as string
  const is_favorite = formData.get('is_favorite') === 'true'
  
  const { error } = await supabase
    .from('resources')
    .update({
      title,
      slug,
      type,
      summary,
      description,
      content,
      source_url,
      status,
      is_favorite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating resource:', error)
    return { error: error.message }
  }
  
  revalidatePath('/resources')
  revalidatePath(`/resources/${slug}`)
  revalidatePath('/')
  redirect(`/resources/${slug}`)
}

export async function deleteResource(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting resource:', error)
    return { error: error.message }
  }
  
  revalidatePath('/resources')
  revalidatePath('/')
  redirect('/resources')
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = await createClient()
  
  await supabase
    .from('resources')
    .update({ is_favorite: !isFavorite })
    .eq('id', id)
  
  revalidatePath('/resources')
  revalidatePath('/')
}

export async function createVariant(formData: FormData) {
  const supabase = await createClient()
  
  const resource_id = formData.get('resource_id') as string
  const platform = formData.get('platform') as string
  const content = formData.get('content') as string
  
  const { data, error } = await supabase
    .from('variants')
    .insert({ resource_id, platform, content })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating variant:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/resources`)
  return { data }
}

export async function updateVariant(variantId: string, formData: FormData) {
  const supabase = await createClient()
  
  const platform = formData.get('platform') as string
  const content = formData.get('content') as string
  
  const { error } = await supabase
    .from('variants')
    .update({ platform, content, updated_at: new Date().toISOString() })
    .eq('id', variantId)
  
  if (error) {
    console.error('Error updating variant:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/resources`)
  return { success: true }
}

export async function deleteVariant(variantId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('variants')
    .delete()
    .eq('id', variantId)
  
  if (error) {
    console.error('Error deleting variant:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/resources`)
  return { success: true }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true, message: '注册成功，请检查邮箱确认链接' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  
  const default_sort = formData.get('default_sort') as string
  const default_platform = formData.get('default_platform') as string
  const openai_api_key = formData.get('openai_api_key') as string
  const anthropic_api_key = formData.get('anthropic_api_key') as string
  const openrouter_api_key = formData.get('openrouter_api_key') as string
  
  const settings: any = {}
  if (default_sort) settings.default_sort = default_sort
  if (default_platform) settings.default_platform = default_platform
  if (openai_api_key) settings.openai_api_key = openai_api_key
  if (anthropic_api_key) settings.anthropic_api_key = anthropic_api_key
  if (openrouter_api_key) settings.openrouter_api_key = openrouter_api_key
  
  const { error } = await saveUserSettings(supabase, settings)
  
  if (error) {
    console.error('Error saving settings:', error)
    return { error: error.message }
  }
  
  revalidatePath('/settings')
  return { success: true }
}
