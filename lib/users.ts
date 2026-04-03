import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import type { User } from '@/lib/types'

export async function getUsersByIpt(iptId: string): Promise<User[]> {
  const data = await prisma.user.findMany({
    where: { ipt_id: iptId },
    orderBy: { nama: 'asc' },
  })
  return data.map(serializeUser)
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
  const passwordHash = await bcrypt.hash(params.password, 10)

  const data = await prisma.user.create({
    data: {
      ipt_id: params.iptId,
      ic_number: params.icNumber,
      nama: params.nama,
      role: params.role,
      kelas_latihan: params.kelasLatihan ?? null,
      password_hash: passwordHash,
    },
  })

  return serializeUser(data)
}

function serializeUser(row: Record<string, unknown>): User {
  const { password_hash: _, ...rest } = row as Record<string, unknown> & { password_hash: string }
  return {
    ...(rest as unknown as User),
    created_at: (row.created_at as Date).toISOString(),
  }
}
