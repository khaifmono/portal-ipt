import { createAdminClient } from '@/lib/supabase/admin'
import type { Ipt } from '@/lib/types'

export async function getAllIpts(): Promise<Ipt[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ipts')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    // Silently return empty list before migrations are applied (table not found = code 42P01)
    if (error.code !== '42P01') console.warn('[getAllIpts]', error.message)
    return []
  }
  return data ?? []
}

export async function getIptBySlug(slug: string): Promise<Ipt | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ipts')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error?.code === 'PGRST116') return null // not found
  if (error) throw error
  return data
}
