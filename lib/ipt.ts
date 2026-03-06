import { createClient } from '@/lib/supabase/server'
import type { Ipt } from '@/lib/types'

export async function getAllIpts(): Promise<Ipt[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ipts')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('[getAllIpts]', error.message)
    return []
  }
  return data ?? []
}

export async function getIptBySlug(slug: string): Promise<Ipt | null> {
  const supabase = await createClient()
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
