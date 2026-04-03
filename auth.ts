import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import type { Role } from '@/lib/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        ic_number: { label: 'IC Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
        ipt_slug: { label: 'IPT Slug', type: 'text' },
      },
      async authorize(credentials) {
        const ic_number = credentials?.ic_number as string | undefined
        const password = credentials?.password as string | undefined
        const ipt_slug = credentials?.ipt_slug as string | undefined

        if (!ic_number || !password || !ipt_slug) return null

        // Find IPT by slug
        const ipt = await prisma.ipt.findFirst({
          where: { slug: ipt_slug, is_active: true },
        })
        if (!ipt) return null

        // Find user by IC number within IPT
        const user = await prisma.user.findUnique({
          where: { ipt_id_ic_number: { ipt_id: ipt.id, ic_number } },
        })
        if (!user) return null

        // Verify password
        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.nama,
          role: user.role,
          ipt_id: user.ipt_id,
          nama: user.nama,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.ipt_id = user.ipt_id
        token.nama = user.nama
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      session.user.ipt_id = token.ipt_id as string
      session.user.nama = token.nama as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
})
