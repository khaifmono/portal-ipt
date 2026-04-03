import { auth } from '@/auth'
import type { Role } from '@/lib/types'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) throw new Error('Forbidden')
  return user
}
