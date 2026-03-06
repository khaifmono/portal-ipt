import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { markAttendance } from '@/lib/attendance'

export async function POST(request: Request) {
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('role, ipt_id')
    .eq('id', currentUser.id)
    .single()

  if (!profile || !['admin', 'super_admin', 'tenaga_pengajar'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, iptId, status, sessionId } = body

  if (!userId || !iptId || !status || !sessionId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  if (!['present', 'absent'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak sah.' }, { status: 400 })
  }

  try {
    const record = await markAttendance({ sessionId, userId, iptId, status })
    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
