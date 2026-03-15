import { NextRequest, NextResponse } from 'next/server'
import { generateSummary } from '@/lib/ai/generate-summary'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }
    
    const summary = await generateSummary(content)
    
    if (!summary) {
      return NextResponse.json({ error: 'AI 服务未配置或生成失败' }, { status: 500 })
    }
    
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
