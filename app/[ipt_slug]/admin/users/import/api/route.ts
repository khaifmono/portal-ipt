import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { createUser } from '@/lib/users'
import type { Role } from '@/lib/types'

interface ImportUserRow {
  ic_number: string
  nama: string
  password?: string
  role?: Role
  kelas_latihan?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string }> }
) {
  const { ipt_slug } = await params

  try {
    await requireRole(['admin', 'super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { users, iptId } = body as { users: ImportUserRow[]; iptId: string }

  if (!Array.isArray(users) || users.length === 0 || !iptId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  let success = 0
  let failed = 0
  const errors: { ic_number: string; error: string }[] = []

  for (const row of users) {
    try {
      // Use ic_number as default password if none provided
      const password = row.password || row.ic_number

      await createUser({
        iptId,
        icNumber: row.ic_number,
        nama: row.nama,
        role: row.role ?? 'ahli',
        kelasLatihan: row.kelas_latihan,
        password,
        iptSlug: ipt_slug,
      })
      success++
    } catch (err) {
      failed++
      let message = 'Ralat tidak diketahui.'
      if (err instanceof Error) {
        // Handle Prisma unique constraint violation
        if (err.message.includes('Unique constraint') || err.message.includes('unique') || err.message.includes('P2002')) {
          message = 'No IC sudah didaftarkan.'
        } else {
          message = err.message
        }
      }
      errors.push({ ic_number: row.ic_number, error: message })
    }
  }

  return NextResponse.json({ success, failed, errors })
}
