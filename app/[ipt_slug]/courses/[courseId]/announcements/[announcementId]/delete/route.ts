import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { deleteAnnouncement } from '@/lib/announcements'
import { redirect } from 'next/navigation'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; announcementId: string }> }
) {
  const { ipt_slug, courseId, announcementId } = await params

  try {
    await requireRole(['admin', 'super_admin', 'tenaga_pengajar'])
  } catch {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  try {
    await deleteAnnouncement(announcementId)
  } catch {
    return NextResponse.json({ error: 'Gagal memadam pengumuman' }, { status: 500 })
  }

  redirect(`/${ipt_slug}/courses/${courseId}`)
}
