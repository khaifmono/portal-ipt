import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { getIptBySlug } from '@/lib/ipt'
import { assignmentSchema, createAssignment } from '@/lib/assignments'
import { notifyEnrolledUsers } from '@/lib/notifications'
import { logActivity } from '@/lib/activity-log'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string }> }
) {
  const { ipt_slug, courseId, weekId } = await params

  let user
  try {
    user = await requireRole(['admin', 'super_admin', 'tenaga_pengajar'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const parsed = assignmentSchema.safeParse({
    ...(body as object),
    dueDate:
      (body as Record<string, unknown>).dueDate
        ? new Date((body as Record<string, unknown>).dueDate as string)
        : undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 })
  }

  const { title, description, type, dueDate, maxScore } = parsed.data

  const assignment = await createAssignment({
    weekId,
    courseId,
    iptId: ipt.id,
    title,
    description,
    type,
    dueDate,
    maxScore,
    createdBy: user.id,
  })

  // Log activity
  logActivity({
    courseId,
    iptId: ipt.id,
    userId: user.id,
    action: 'Menambah tugasan',
    details: title,
  }).catch(() => {})

  // Notify enrolled students about the new assignment
  notifyEnrolledUsers(
    courseId,
    `Tugasan Baru: ${title}`,
    description ?? 'Tugasan baru telah ditambah.',
    `/${ipt_slug}/courses/${courseId}/week/${weekId}`,
  ).catch(() => {})

  return NextResponse.json(assignment, { status: 201 })
}
