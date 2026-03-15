'use client'

import Link from 'next/link'
import { FavoriteButton } from '@/components/favorite-button'
import { FrequentButton } from '@/components/frequent-button'

interface ActionButtonsProps {
  resourceId: string
  isFavorite: boolean
  isFrequent: boolean
  slug: string
}

export function ActionButtons({ resourceId, isFavorite, isFrequent, slug }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 items-center">
      <FavoriteButton resourceId={resourceId} isFavorite={isFavorite} />
      <FrequentButton resourceId={resourceId} isFrequent={isFrequent} />
      <Link
        href={`/resources/${slug}/edit`}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        编辑
      </Link>
    </div>
  )
}
