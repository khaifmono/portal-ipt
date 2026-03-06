import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types'

export async function getUsersByIpt(iptId: string): Promise<User[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('ipt_id', iptId)
    .order('nama')

  if (error) throw error
  return data ?? []
}

export async function createUser(params: {
  iptId: string
  icNumber: string
  nama: string
  role: User['role']
  kelasLatihan?: string
  password: string
  iptSlug: string
}): Promise<User> {
  const supabase = await createClient()

  // Create auth user with synthetic email
  const email = `${params.icNumber}@${params.iptSlug}.psscm`
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      ipt_id: params.iptId,
      role: params.role,
    },
  })

  if (authError) throw authError

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      ipt_id: params.iptId,
      ic_number: params.icNumber,
      nama: params.nama,
      role: params.role,
      kelas_latihan: params.kelasLatihan ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
