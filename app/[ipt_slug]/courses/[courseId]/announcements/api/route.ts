import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { getIptBySlug } from '@/lib/ipt'
import { createAnnouncement } from '@/lib/announcements'
import { notifyEnrolledUsers } from '@/lib/notifications'
import { logActivity } from '@/lib/activity-log'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string }> }
) {
  const { ipt_slug, courseId } = await params

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

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak sah' }, { status: 400 })
  }

  const title = body.title as string | undefined
  const content = body.content as string | undefined
  const isPinned = body.isPinned as boolean | undefined

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Tajuk diperlukan' }, { status: 422 })
  }

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Kandungan diperlukan' }, { status: 422 })
  }

  const announcement = await createAnnouncement({
    courseId,
    iptId: ipt.id,
    title: title.trim(),
    content: content.trim(),
    isPinned: isPinned ?? false,
    createdBy: user.id,
  })

  // Log activity
  logActivity({
    courseId,
    iptId: ipt.id,
    userId: user.id,
    action: 'Mencipta pengumuman',
    details: title.trim(),
  }).catch(() => {})

  // Notify all enrolled users about the new announcement
  notifyEnrolledUsers(
    courseId,
    `Pengumuman Baru: ${title.trim()}`,
    content.trim().slice(0, 200),
    `/${ipt_slug}/courses/${courseId}`,
  ).catch(() => {})

  return NextResponse.json(announcement, { status: 201 })
}
