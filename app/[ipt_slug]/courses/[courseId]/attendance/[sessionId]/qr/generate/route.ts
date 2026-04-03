import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSessionById } from '@/lib/attendance'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; sessionId: string }> }
) {
  const currentUser = await getUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Tidak dibenarkan.' }, { status: 401 })
  }

  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  }

  const { ipt_slug, courseId, sessionId } = await params

  const attendanceSession = await getSessionById(sessionId)
  if (!attendanceSession || attendanceSession.course_id !== courseId) {
    return NextResponse.json({ error: 'Sesi tidak dijumpai.' }, { status: 404 })
  }

  const token = randomUUID()

  await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: { qr_token: token },
  })

  const origin = request.headers.get('origin') || request.headers.get('host') || ''
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
  const markUrl = `${baseUrl}/${ipt_slug}/attendance/mark?token=${token}&session=${sessionId}`

  return NextResponse.json({ token, url: markUrl }, { status: 200 })
}
