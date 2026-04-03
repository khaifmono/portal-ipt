import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getSessionById, getAttendanceReport } from '@/lib/attendance'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AttendanceMarker } from './AttendanceMarker'

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

  const enrolledUsers = enrollments.map((e) => ({
    userId: e.user_id,
    nama: e.user.nama,
    icNumber: e.user.ic_number,
    currentStatus: recordMap.get(e.user_id)?.status ?? null,
  }))

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/attendance`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke Senarai Sesi
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{attendanceSession.title}</h1>
        <p className="text-gray-500 text-sm mb-6">
          {new Date(attendanceSession.session_date).toLocaleDateString('ms-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {enrolledUsers.length === 0 ? (
          <p className="text-gray-500">Tiada pelajar berdaftar dalam kursus ini.</p>
        ) : (
          <ul className="space-y-3">
            {enrolledUsers.map((eu) => (
              <li
                key={eu.userId}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4"
              >
                <div>
                  <div className="font-medium text-gray-900">{eu.nama}</div>
                  <div className="text-sm text-gray-500">{eu.icNumber}</div>
                </div>
                <AttendanceMarker
                  sessionId={sessionId}
                  userId={eu.userId}
                  iptId={ipt.id}
                  iptSlug={ipt_slug}
                  courseId={courseId}
                  currentStatus={eu.currentStatus}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
