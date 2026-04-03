import { prisma } from '@/lib/db'
import { Prisma } from './generated/prisma/client'
import type { AttendanceSession, AttendanceRecord, AttendanceStatusType } from '@/lib/types'

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
  status: AttendanceStatusType
  remark?: string
}): Promise<AttendanceRecord> {
  try {
    const data = await prisma.attendanceRecord.upsert({
      where: {
        session_id_user_id: {
          session_id: params.sessionId,
          user_id: params.userId,
        },
      },
      update: {
        status: params.status,
        remark: params.remark ?? null,
        marked_at: new Date(),
      },
      create: {
        session_id: params.sessionId,
        user_id: params.userId,
        ipt_id: params.iptId,
        status: params.status,
        remark: params.remark ?? null,
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

export async function bulkMarkAttendance(params: {
  sessionId: string
  iptId: string
  records: { userId: string; status: AttendanceStatusType; remark?: string }[]
}): Promise<AttendanceRecord[]> {
  const results: AttendanceRecord[] = []
  for (const record of params.records) {
    const result = await markAttendance({
      sessionId: params.sessionId,
      userId: record.userId,
      iptId: params.iptId,
      status: record.status,
      remark: record.remark,
    })
    results.push(result)
  }
  return results
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
    orderBy: { session: { session_date: 'desc' } },
  })

  return data.map((row) => ({
    ...serializeRecord(row),
    session: serializeSession(row.session),
  }))
}

export async function getCourseAttendanceSummary(courseId: string) {
  const sessions = await prisma.attendanceSession.findMany({
    where: { course_id: courseId },
    include: {
      records: {
        include: { user: true },
      },
    },
    orderBy: { session_date: 'desc' },
  })

  return sessions.map((session) => ({
    ...serializeSession(session),
    records: session.records.map((r) => ({
      ...serializeRecord(r),
      user: {
        id: r.user.id,
        nama: r.user.nama,
        ic_number: r.user.ic_number,
        kelas_latihan: r.user.kelas_latihan,
      },
    })),
    stats: {
      present: session.records.filter((r) => r.status === 'present').length,
      absent: session.records.filter((r) => r.status === 'absent').length,
      late: session.records.filter((r) => r.status === 'late').length,
      excused: session.records.filter((r) => r.status === 'excused').length,
      total: session.records.length,
    },
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
