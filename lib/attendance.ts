import { prisma } from '@/lib/db'
import { Prisma } from './generated/prisma/client'
import type { AttendanceSession, AttendanceRecord } from '@/lib/types'

export async function createSession(params: {
  courseId: string
  iptId: string
  sessionDate: string
  title: string
  createdBy: string
}): Promise<AttendanceSession> {
  const data = await prisma.attendanceSession.create({
    data: {
      course_id: params.courseId,
      ipt_id: params.iptId,
      session_date: new Date(params.sessionDate),
      title: params.title,
      created_by: params.createdBy,
    },
  })
  return serializeSession(data)
}

export async function getSessionsByCourse(courseId: string): Promise<AttendanceSession[]> {
  const data = await prisma.attendanceSession.findMany({
    where: { course_id: courseId },
    orderBy: { session_date: 'desc' },
  })
  return data.map(serializeSession)
}

export async function getSessionById(sessionId: string): Promise<AttendanceSession | null> {
  const data = await prisma.attendanceSession.findUnique({ where: { id: sessionId } })
  return data ? serializeSession(data) : null
}

export async function markAttendance(params: {
  sessionId: string
  userId: string
  iptId: string
  status: 'present' | 'absent'
}): Promise<AttendanceRecord> {
  try {
    const data = await prisma.attendanceRecord.create({
      data: {
        session_id: params.sessionId,
        user_id: params.userId,
        ipt_id: params.iptId,
        status: params.status,
      },
    })
    return serializeRecord(data)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new Error('Rekod kehadiran sudah wujud')
    }
    throw e
  }
}

export async function getAttendanceReport(sessionId: string): Promise<AttendanceRecord[]> {
  const data = await prisma.attendanceRecord.findMany({
    where: { session_id: sessionId },
  })
  return data.map(serializeRecord)
}

export async function getUserAttendanceHistory(
  userId: string,
  courseId: string
): Promise<(AttendanceRecord & { session: AttendanceSession })[]> {
  const data = await prisma.attendanceRecord.findMany({
    where: {
      user_id: userId,
      session: { course_id: courseId },
    },
    include: { session: true },
  })

  return data.map((row) => ({
    ...serializeRecord(row),
    session: serializeSession(row.session),
  }))
}

function serializeSession(row: Record<string, unknown>): AttendanceSession {
  return {
    ...(row as unknown as AttendanceSession),
    session_date: row.session_date instanceof Date
      ? row.session_date.toISOString().split('T')[0]
      : String(row.session_date),
    created_at: (row.created_at as Date).toISOString(),
  }
}

function serializeRecord(row: Record<string, unknown>): AttendanceRecord {
  return {
    ...(row as unknown as AttendanceRecord),
    marked_at: (row.marked_at as Date).toISOString(),
  }
}
