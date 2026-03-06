import { createClient } from '@/lib/supabase/server'

export { loginSchema, type LoginInput } from '@/lib/auth-schema'

/** Constructs a synthetic email used internally with Supabase Auth */
function toAuthEmail(icNumber: string, iptSlug: string): string {
  return `${icNumber}@${iptSlug}.psscm`
}

export async function login(icNumber: string, password: string, iptSlug: string) {
  const supabase = await createClient()
  const email = toAuthEmail(icNumber, iptSlug)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}
