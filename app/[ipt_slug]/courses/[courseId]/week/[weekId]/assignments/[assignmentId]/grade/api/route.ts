import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { gradeSubmission } from '@/lib/grading'

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
  // Validate role
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
  }

  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'super_admin', 'tenaga_pengajar'].includes(role)) {
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
    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
