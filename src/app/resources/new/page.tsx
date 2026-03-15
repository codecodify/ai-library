import { getPlatforms } from '@/lib/db/platforms'
import { getResourceTypes } from '@/lib/db/resource-types'
import NewResourcePageClient from './client'

export default async function NewResourcePage() {
  const platforms = await getPlatforms()
  const resourceTypes = await getResourceTypes()
  return <NewResourcePageClient platforms={platforms} resourceTypes={resourceTypes} />
}
