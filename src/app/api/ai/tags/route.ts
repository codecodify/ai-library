import { NextRequest, NextResponse } from 'next/server'
import { suggestTags } from '@/lib/ai/suggest-tags'

export async function POST(request: NextRequest) {
  try {
    const { content, existingTags } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }
    
    const tags = await suggestTags(content, existingTags || [])
    
    if (!tags || tags.length === 0) {
      return NextResponse.json({ error: 'AI 服务未配置或生成失败' }, { status: 500 })
    }
    
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error suggesting tags:', error)
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
