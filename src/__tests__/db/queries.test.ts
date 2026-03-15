import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createResource,
  updateResource,
  deleteResource,
  getResourceBySlug,
  listResources,
  searchResources,
  createVariant,
  updateVariant,
  deleteVariant,
  listTags,
  createTag,
  logViewEvent,
  logCopyEvent,
} from '@/lib/db/queries'
import * as supabaseServer from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

describe('Database Queries - Basic Execution', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const mockQueryBuilder = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    const mockTable = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQueryBuilder)
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockQueryBuilder)
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      }),
      select: vi.fn().mockReturnValue(mockQueryBuilder),
    }

    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockTable),
      rpc: vi.fn().mockResolvedValue({ error: null }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('should execute deleteResource without throwing', async () => {
    await expect(deleteResource('1')).resolves.not.toThrow()
  })

  it('should execute deleteVariant without throwing', async () => {
    await expect(deleteVariant('v1')).resolves.not.toThrow()
  })

  it('should execute logViewEvent without throwing', async () => {
    await expect(logViewEvent('1')).resolves.not.toThrow()
  })

  it('should execute logCopyEvent without throwing', async () => {
    await expect(logCopyEvent('1')).resolves.not.toThrow()
  })

  it('should execute listResources without throwing', async () => {
    await expect(listResources()).resolves.not.toThrow()
  })

  it('should execute searchResources without throwing', async () => {
    await expect(searchResources('test')).resolves.not.toThrow()
  })

  it('should execute listTags without throwing', async () => {
    await expect(listTags()).resolves.not.toThrow()
  })
})

describe('Database Queries - Functions with Return Values', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupMockWithData = (singleData: any, selectData: any = []) => {
    const mockSingleQueryBuilder = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    }

    const mockSelectQueryBuilder = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: selectData, error: null }),
    }

    const mockTable = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockSingleQueryBuilder)
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockSingleQueryBuilder)
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      }),
      select: vi.fn().mockReturnValue(mockSelectQueryBuilder),
    }

    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockTable),
      rpc: vi.fn().mockResolvedValue({ error: null }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  }

  it('should createResource and return data', async () => {
    const mockResource = { id: '1', slug: 'test', title: 'Test', type: 'agent' }
    setupMockWithData(mockResource)

    const result = await createResource({
      slug: 'test',
      title: 'Test',
      type: 'agent'
    })

    expect(result).toBeDefined()
  })

  it('should updateResource and return data', async () => {
    const mockResource = { id: '1', title: 'Updated' }
    setupMockWithData(mockResource)

    const result = await updateResource('1', { title: 'Updated' })
    expect(result).toBeDefined()
  })

  it('should createVariant and return data', async () => {
    const mockVariant = { id: 'v1', resource_id: '1', platform: 'chatgpt' }
    setupMockWithData(mockVariant)

    const result = await createVariant({
      resource_id: '1',
      platform: 'chatgpt',
      content: 'test'
    })

    expect(result).toBeDefined()
  })

  it('should updateVariant and return data', async () => {
    const mockVariant = { id: 'v1', content: 'updated' }
    setupMockWithData(mockVariant)

    const result = await updateVariant('v1', { content: 'updated' })
    expect(result).toBeDefined()
  })

  it('should createTag and return data', async () => {
    const mockTag = { id: 't1', name: 'newtag' }
    setupMockWithData(mockTag)

    const result = await createTag('newtag')
    expect(result).toBeDefined()
  })

  it('should getResourceBySlug and return null when not found', async () => {
    const mockQueryBuilder = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      }),
    }

    const mockTagVariantQueryBuilder = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    const mockSupabase = {
      from: vi.fn().mockImplementation((tableName: string) => {
        if (tableName === 'resources') {
          return { select: () => mockQueryBuilder }
        }
        return { select: () => mockTagVariantQueryBuilder }
      }),
      rpc: vi.fn().mockResolvedValue({ error: null }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)

    const result = await getResourceBySlug('not-found')
    expect(result).toBeNull()
  })
})
