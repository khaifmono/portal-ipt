import { prisma } from '@/lib/db'

export interface NotificationData {
  id: string
  user_id: string
  ipt_id: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

// ── Queries ──────────────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { user_id: userId, is_read: false },
  })
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<NotificationData[]> {
  const rows = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: limit,
  })
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    ipt_id: r.ipt_id,
    title: r.title,
    message: r.message,
    link: r.link,
    is_read: r.is_read,
    created_at: r.created_at.toISOString(),
  }))
}

// ── Mutations ────────────────────────────────────────────

export async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  })
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  })
}

export async function createNotification(params: {
  userId: string
  iptId: string
  title: string
  message: string
  link?: string
}) {
  return prisma.notification.create({
    data: {
      user_id: params.userId,
      ipt_id: params.iptId,
      title: params.title,
      message: params.message,
      link: params.link ?? null,
    },
  })
}

// ── Bulk helper ──────────────────────────────────────────

/**
 * Create a notification for every user enrolled in a course.
 * Useful when an instructor creates an announcement, assignment, etc.
 */
export async function notifyEnrolledUsers(
  courseId: string,
  title: string,
  message: string,
  link?: string
) {
  const enrollments = await prisma.enrollment.findMany({
    where: { course_id: courseId },
    select: { user_id: true, ipt_id: true },
  })

  if (enrollments.length === 0) return

  await prisma.notification.createMany({
    data: enrollments.map((e) => ({
      user_id: e.user_id,
      ipt_id: e.ipt_id,
      title,
      message,
      link: link ?? null,
    })),
  })
}
