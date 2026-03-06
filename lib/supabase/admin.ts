import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client — bypasses RLS. Only use in server-side API routes
 * after validating the caller's identity and permissions first.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
