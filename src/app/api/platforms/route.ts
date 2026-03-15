import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PlatformData } from '@/types/resource'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('platforms')
    .insert({
      name: body.name,
      slug: body.slug,
      icon: body.icon || null,
      is_default: body.is_default || false,
      sort_order: body.sort_order || 0,
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data as PlatformData)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('platforms')
    .update({
      name: body.name,
      icon: body.icon,
      is_default: body.is_default,
      sort_order: body.sort_order,
    })
    .eq('id', body.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data as PlatformData)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data: variants } = await supabase
    .from('variants')
    .select('id')
    .eq('platform', body.id)
    .limit(1)
  
  if (variants && variants.length > 0) {
    return NextResponse.json(
      { error: '该平台已被资源使用，无法删除' },
      { status: 400 }
    )
  }
  
  const { error } = await supabase
    .from('platforms')
    .delete()
    .eq('id', body.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({ success: true })
}
