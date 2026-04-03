import { NextResponse } from 'next/server'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById, duplicateCourse } from '@/lib/courses'
import { requireRole } from '@/lib/auth-helpers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string }> }
) {
  const { ipt_slug, courseId } = await params

  let user
  try {
    user = await requireRole(['admin', 'super_admin'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai.' }, { status: 404 })
  }

  const originalCourse = await getCourseById(courseId)
  if (!originalCourse || originalCourse.ipt_id !== ipt.id) {
    return NextResponse.json({ error: 'Kursus tidak dijumpai.' }, { status: 404 })
  }

  const body = await request.json()
  const title = body.title?.trim() || `Salinan: ${originalCourse.title}`

  try {
    const newCourse = await duplicateCourse(courseId, title, user.id)
    return NextResponse.json(newCourse, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
