import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { markAttendance, bulkMarkAttendance } from '@/lib/attendance'

const VALID_STATUSES = ['present', 'absent', 'late', 'excused'] as const

export async function POST(request: Request) {
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()

  // Bulk marking
  if (body.records && Array.isArray(body.records)) {
    const { sessionId, iptId, records } = body
    if (!sessionId || !iptId || records.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    }

    for (const r of records) {
      if (!VALID_STATUSES.includes(r.status)) {
        return NextResponse.json({ error: `Status '${r.status}' tidak sah.` }, { status: 400 })
      }
    }

    try {
      const results = await bulkMarkAttendance({ sessionId, iptId, records })
      return NextResponse.json(results, { status: 201 })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  // Single marking
  const { userId, iptId, status, sessionId, remark } = body

  if (!userId || !iptId || !status || !sessionId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status tidak sah.' }, { status: 400 })
  }

  try {
    const record = await markAttendance({ sessionId, userId, iptId, status, remark })
    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
