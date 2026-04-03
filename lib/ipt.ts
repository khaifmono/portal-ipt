import { prisma } from '@/lib/db'
import type { Ipt } from '@/lib/types'

export async function getAllIpts(): Promise<Ipt[]> {
  const data = await prisma.ipt.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
  })
  return data.map(serializeIpt)
}

export async function getIptBySlug(slug: string): Promise<Ipt | null> {
  const data = await prisma.ipt.findFirst({
    where: { slug, is_active: true },
  })
  return data ? serializeIpt(data) : null
}

function serializeIpt(row: Record<string, unknown>): Ipt {
  return {
    ...(row as unknown as Ipt),
    created_at: (row.created_at as Date).toISOString(),
  }
}
