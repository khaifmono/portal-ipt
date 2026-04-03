import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { enrollUser, unenrollUser } from '@/lib/enrollments'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string }> }
) {
  const { courseId } = await params

  try {
    await requireRole(['admin', 'super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, iptId } = body

  if (!userId || !iptId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  try {
    const enrollment = await enrollUser(courseId, userId, iptId)
    return NextResponse.json({ success: true, enrollment }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string }> }
) {
  const { courseId } = await params

  try {
    await requireRole(['admin', 'super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const body = await request.json()
  const { userId } = body

  if (!userId) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
  }

  try {
    await unenrollUser(courseId, userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
