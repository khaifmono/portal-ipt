import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { createSchedule } from '@/lib/schedule'

export async function POST(request: Request) {
  try {
    await requireRole(['admin', 'super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { courseId, iptId, title, startTime, endTime, location, recurring, createdBy } = body

  if (!courseId || !iptId || !title || !startTime || !endTime || !createdBy) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  try {
    const schedule = await createSchedule({
      courseId,
      iptId,
      title,
      startTime,
      endTime,
      location,
      recurring,
      createdBy,
    })
    return NextResponse.json(schedule, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
