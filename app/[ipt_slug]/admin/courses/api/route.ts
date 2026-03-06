import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { createCourse } from '@/lib/courses'

export async function POST(request: Request) {
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, iptId, userId } = body

  if (!title || !iptId || !userId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  try {
    const course = await createCourse({ iptId, title, description, createdBy: userId })
    return NextResponse.json(course, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
