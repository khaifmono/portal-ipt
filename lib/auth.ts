import { auth } from '@/auth'

export { loginSchema, type LoginInput } from '@/lib/auth-schema'

export async function getSession() {
  return auth()
}

export async function getUser() {
  const session = await auth()
  return session?.user ?? null
}
