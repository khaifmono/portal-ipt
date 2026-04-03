import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { createUser } from '@/lib/users'

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
  const { ic_number, nama, kelas_latihan, role, password, iptId } = body

  if (!ic_number || !nama || !password || !iptId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  try {
    const user = await createUser({
      iptId,
      icNumber: ic_number,
      nama,
      role: role ?? 'ahli',
      kelasLatihan: kelas_latihan,
      password,
      iptSlug: ipt_slug,
    })
    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
