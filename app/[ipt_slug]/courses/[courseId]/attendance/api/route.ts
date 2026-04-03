import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createSession } from '@/lib/attendance'

export async function POST(request: Request) {
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { courseId, iptId, sessionDate, title, createdBy } = body

  if (!courseId || !iptId || !sessionDate || !title || !createdBy) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  try {
    const session = await createSession({ courseId, iptId, sessionDate, title, createdBy })
    return NextResponse.json(session, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
