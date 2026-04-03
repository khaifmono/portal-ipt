import { prisma } from '@/lib/db'

interface LogActivityParams {
  courseId?: string
  iptId: string
  userId: string
  action: string
  details?: string
}

export async function logActivity({
  courseId,
  iptId,
  userId,
  action,
  details,
}: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      course_id: courseId ?? null,
      ipt_id: iptId,
      user_id: userId,
      action,
      details: details ?? null,
    },
  })
}

export async function getActivityLog(courseId: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { course_id: courseId },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, nama: true, role: true } },
    },
  })
}

export async function getIptActivityLog(iptId: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { ipt_id: iptId },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, nama: true, role: true } },
      course: { select: { id: true, title: true } },
    },
  })
}
