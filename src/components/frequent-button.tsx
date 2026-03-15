'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

interface FrequentButtonProps {
  resourceId: string
  isFrequent: boolean
}

export function FrequentButton({ resourceId, isFrequent: initialFrequent }: FrequentButtonProps) {
  const [isFrequent, setIsFrequent] = useState(initialFrequent)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    setLoading(true)
    
    const newFrequent = !isFrequent
    
    const { error } = await supabase
      .from('resources')
      .update({ is_frequent: newFrequent })
      .eq('id', resourceId)
    
    if (!error) {
      setIsFrequent(newFrequent)
      revalidatePath('/')
      revalidatePath('/resources')
    }
    
    setLoading(false)
  }
  
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-lg ${isFrequent ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
      title={isFrequent ? '取消常用' : '标记为常用'}
    >
      {loading ? '...' : '✓'}
    </button>
  )
}
