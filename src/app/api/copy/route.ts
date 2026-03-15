import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { resourceId } = await request.json()
    
    if (!resourceId) {
      return NextResponse.json({ error: '资源 ID 不能为空' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: resource } = await supabase
      .from('resources')
      .select('copy_count')
      .eq('id', resourceId)
      .single()
    
    const newCount = (resource?.copy_count || 0) + 1
    
    await supabase
      .from('resources')
      .update({
        copy_count: newCount,
        last_copied_at: new Date().toISOString(),
      })
      .eq('id', resourceId)
    
    await supabase
      .from('events')
      .insert({ resource_id: resourceId, event_type: 'copy' })
    
    return NextResponse.json({ success: true, count: newCount })
  } catch (error) {
    console.error('Error updating copy count:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
