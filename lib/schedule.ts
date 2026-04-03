import { prisma } from '@/lib/db'
import type { Schedule } from '@/lib/types'

export async function createSchedule(params: {
  courseId: string
  iptId: string
  title: string
  startTime: string
  endTime: string
  location?: string
  recurring?: boolean
  createdBy: string
}): Promise<Schedule> {
  if (!params.iptId) throw new Error('ipt_id diperlukan')

  const start = new Date(params.startTime)
  const end = new Date(params.endTime)
  if (start >= end) {
    throw new Error('Masa mula mesti sebelum masa tamat')
  }

  const data = await prisma.schedule.create({
    data: {
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      start_time: start,
      end_time: end,
      location: params.location ?? null,
      recurring: params.recurring ?? false,
      created_by: params.createdBy,
    },
  })
  return serialize(data)
}

export async function getSchedulesByCourse(courseId: string): Promise<Schedule[]> {
  const data = await prisma.schedule.findMany({
    where: { course_id: courseId },
    orderBy: { start_time: 'asc' },
  })
  return data.map(serialize)
}

export async function getSchedulesByIpt(iptId: string): Promise<Schedule[]> {
  const data = await prisma.schedule.findMany({
    where: { ipt_id: iptId },
    orderBy: { start_time: 'asc' },
  })
  return data.map(serialize)
}

function serialize(row: Record<string, unknown>): Schedule {
  return {
    ...(row as unknown as Schedule),
    start_time: (row.start_time as Date).toISOString(),
    end_time: (row.end_time as Date).toISOString(),
    created_at: (row.created_at as Date).toISOString(),
  }
}
