import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { gradeSubmission } from '@/lib/grading'
import { createNotification } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      ipt_slug: string
      courseId: string
      weekId: string
      assignmentId: string
    }>
  }
) {
  const { ipt_slug, courseId, weekId } = await params

  let user
  try {
    user = await requireRole(['admin', 'super_admin', 'tenaga_pengajar'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  let body: { submissionId?: unknown; grade?: unknown; feedback?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const { submissionId, grade, feedback } = body

  if (typeof submissionId !== 'string' || !submissionId) {
    return NextResponse.json({ error: 'submissionId diperlukan' }, { status: 422 })
  }

  const gradeNum = Number(grade)
  if (isNaN(gradeNum)) {
    return NextResponse.json({ error: 'Markah mesti nombor' }, { status: 422 })
  }

  const feedbackStr = typeof feedback === 'string' ? feedback : undefined

  try {
    const result = await gradeSubmission(submissionId, gradeNum, feedbackStr, user.id)

    // Notify the student that their submission has been graded
    createNotification({
      userId: result.user_id,
      iptId: result.ipt_id,
      title: `Tugasan Dinilai: ${gradeNum}/100`,
      message: feedbackStr ?? 'Tugasan anda telah dinilai.',
      link: `/${ipt_slug}/courses/${courseId}/week/${weekId}`,
    }).catch(() => {})

    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
