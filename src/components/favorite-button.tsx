'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/app/actions'

interface FavoriteButtonProps {
  resourceId: string
  isFavorite: boolean
}

export function FavoriteButton({ resourceId, isFavorite: initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    setLoading(true)
    
    const newFavorite = !isFavorite
    
    await toggleFavorite(resourceId, newFavorite)
    setIsFavorite(newFavorite)
    
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
