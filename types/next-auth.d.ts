import type { Role } from '@/lib/types'

declare module 'next-auth' {
  interface User {
    role: Role
    ipt_id: string
    nama: string
  }
  interface Session {
    user: User & {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    ipt_id: string
    nama: string
  }
}
