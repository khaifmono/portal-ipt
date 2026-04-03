import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { createCourse } from '@/lib/courses'

export async function POST(request: Request) {
  try {
    await requireRole(['admin', 'super_admin'])
  } catch {
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
