import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth'
import { createSchedule } from '@/lib/schedule'

export async function POST(request: Request) {
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
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
