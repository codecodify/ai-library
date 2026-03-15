'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

interface FavoriteButtonProps {
  resourceId: string
  isFavorite: boolean
}

export function FavoriteButton({ resourceId, isFavorite: initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    setLoading(true)
    
    const newFavorite = !isFavorite
    
    const { error } = await supabase
      .from('resources')
      .update({ is_favorite: newFavorite })
      .eq('id', resourceId)
    
    if (!error) {
      setIsFavorite(newFavorite)
      revalidatePath('/')
      revalidatePath('/resources')
    }
    
    setLoading(false)
  }
  
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-lg ${isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
      title={isFavorite ? '取消收藏' : '添加收藏'}
    >
      {loading ? '...' : '★'}
    </button>
  )
}
