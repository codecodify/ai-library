import { NextRequest, NextResponse } from 'next/server'
import { generateVariant } from '@/lib/ai/generate-variant'
import { Platform } from '@/types/resource'

export async function POST(request: NextRequest) {
  try {
    const { content, platform } = await request.json()
    
    if (!content || !platform) {
      return NextResponse.json({ error: '内容和平台不能为空' }, { status: 400 })
    }
    
    const variantContent = await generateVariant(content, platform as Platform)
    
    if (!variantContent) {
      return NextResponse.json({ error: 'AI 服务未配置或生成失败' }, { status: 500 })
    }
    
    return NextResponse.json({ content: variantContent })
  } catch (error) {
    console.error('Error generating variant:', error)
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
