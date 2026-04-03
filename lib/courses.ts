import { prisma } from '@/lib/db'
import type { Course, CourseWeek } from '@/lib/types'

export async function getCoursesByIpt(iptId: string): Promise<Course[]> {
  const data = await prisma.course.findMany({
    where: { ipt_id: iptId },
    orderBy: { created_at: 'desc' },
  })
  return data.map(serialize)
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const data = await prisma.course.findUnique({ where: { id: courseId } })
  return data ? serialize(data) : null
}

export async function createCourse(params: {
  iptId: string
  title: string
  description?: string
  createdBy: string
}): Promise<Course> {
  if (!params.iptId) throw new Error('ipt_id diperlukan untuk mencipta kursus')

  const data = await prisma.course.create({
    data: {
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      created_by: params.createdBy,
    },
  })
  return serialize(data)
}

export async function getWeeksByCourse(courseId: string): Promise<CourseWeek[]> {
  const data = await prisma.courseWeek.findMany({
    where: { course_id: courseId },
    orderBy: { week_number: 'asc' },
  })
  return data.map(serializeWeek)
}

export async function addWeekToCourse(params: {
  courseId: string
  iptId: string
  title: string
  description?: string
}): Promise<CourseWeek> {
  const lastWeek = await prisma.courseWeek.findFirst({
    where: { course_id: params.courseId },
    orderBy: { week_number: 'desc' },
    select: { week_number: true },
  })

  const nextWeekNumber = lastWeek ? lastWeek.week_number + 1 : 1

  const data = await prisma.courseWeek.create({
    data: {
      course_id: params.courseId,
      ipt_id: params.iptId,
      week_number: nextWeekNumber,
      title: params.title,
      description: params.description ?? null,
    },
  })
  return serializeWeek(data)
}

function serialize(row: Record<string, unknown>): Course {
  return { ...(row as unknown as Course), created_at: (row.created_at as Date).toISOString() }
}

function serializeWeek(row: Record<string, unknown>): CourseWeek {
  return { ...(row as unknown as CourseWeek), created_at: (row.created_at as Date).toISOString() }
}
