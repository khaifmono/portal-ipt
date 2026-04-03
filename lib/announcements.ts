import { prisma } from '@/lib/db'
import type { Announcement } from '@/lib/types'

export async function getAnnouncementsByCourse(courseId: string): Promise<Announcement[]> {
  const data = await prisma.announcement.findMany({
    where: { course_id: courseId },
    orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
  })
  return data.map(serialize)
}

export async function getAnnouncementsByIpt(iptId: string): Promise<Announcement[]> {
  const data = await prisma.announcement.findMany({
    where: { ipt_id: iptId },
    orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
  })
  return data.map(serialize)
}

export async function getRecentAnnouncements(iptId: string, limit = 5): Promise<Announcement[]> {
  const data = await prisma.announcement.findMany({
    where: { ipt_id: iptId },
    orderBy: { created_at: 'desc' },
    take: limit,
  })
  return data.map(serialize)
}

export async function createAnnouncement(params: {
  courseId?: string
  iptId: string
  title: string
  content: string
  isPinned?: boolean
  createdBy: string
}): Promise<Announcement> {
  const data = await prisma.announcement.create({
    data: {
      course_id: params.courseId ?? null,
      ipt_id: params.iptId,
      title: params.title,
      content: params.content,
      is_pinned: params.isPinned ?? false,
      created_by: params.createdBy,
    },
  })
  return serialize(data)
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await prisma.announcement.delete({ where: { id: announcementId } })
}

function serialize(row: Record<string, unknown>): Announcement {
  return {
    ...(row as unknown as Announcement),
    created_at: (row.created_at as Date).toISOString(),
  }
}
