import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getSessionById, getAttendanceReport } from '@/lib/attendance'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BulkAttendanceForm } from './BulkAttendanceForm'
import type { AttendanceStatusType } from '@/lib/types'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; sessionId: string }>
}) {
  const { ipt_slug, courseId, sessionId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(user.role)) {
    redirect(`/${ipt_slug}/courses/${courseId}/attendance`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const attendanceSession = await getSessionById(sessionId)
  if (!attendanceSession || attendanceSession.course_id !== courseId) notFound()

  // Get enrolled users for this course
  const enrollments = await prisma.enrollment.findMany({
    where: { course_id: courseId, ipt_id: ipt.id },
    include: { user: { select: { id: true, nama: true, ic_number: true } } },
  })

  const records = await getAttendanceReport(sessionId)
  const recordMap = new Map(records.map((r) => [r.user_id, r]))

  const students = enrollments.map((e) => ({
    userId: e.user_id,
    nama: e.user.nama,
    icNumber: e.user.ic_number,
  }))

  const existingRecords: Record<string, { status: AttendanceStatusType; remark: string | null }> = {}
  for (const [userId, record] of recordMap) {
    existingRecords[userId] = {
      status: record.status,
      remark: record.remark,
    }
  }

  const formattedDate = new Date(attendanceSession.session_date).toLocaleDateString('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Count stats for existing records
  const stats = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
    unmarked: students.length - records.length,
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/attendance`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Kembali ke Senarai Sesi
        </Link>

        {/* Session header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{attendanceSession.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{formattedDate}</p>
            </div>
            <Link
              href={`/${ipt_slug}/courses/${courseId}/attendance/${sessionId}/qr`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              </svg>
              Kod QR
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">
              P: {stats.present}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
              A: {stats.absent}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
              L: {stats.late}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
              E: {stats.excused}
            </span>
            {stats.unmarked > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-xs font-semibold">
                Belum ditanda: {stats.unmarked}
              </span>
            )}
          </div>
        </div>

        {/* Marking form */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Tiada pelajar berdaftar dalam kursus ini.</p>
          </div>
        ) : (
          <BulkAttendanceForm
            sessionId={sessionId}
            iptId={ipt.id}
            iptSlug={ipt_slug}
            courseId={courseId}
            students={students}
            existingRecords={existingRecords}
          />
        )}
      </div>
    </main>
  )
}
