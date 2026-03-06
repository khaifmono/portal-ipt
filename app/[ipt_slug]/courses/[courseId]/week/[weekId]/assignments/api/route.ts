import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getIptBySlug } from '@/lib/ipt'
import { assignmentSchema, createAssignment } from '@/lib/assignments'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string }> }
) {
  const { ipt_slug, courseId, weekId } = await params

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
  }

  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'super_admin', 'tenaga_pengajar'].includes(role)) {
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

  return NextResponse.json(assignment, { status: 201 })
}
