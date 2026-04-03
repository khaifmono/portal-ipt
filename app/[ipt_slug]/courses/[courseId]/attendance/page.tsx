import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getSessionsByCourse, getUserAttendanceHistory } from '@/lib/attendance'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const isStaff = ['admin', 'super_admin', 'tenaga_pengajar'].includes(user.role)

  if (isStaff) {
    const sessions = await getSessionsByCourse(courseId)

    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${ipt_slug}/courses/${courseId}`}
            className="text-sm text-blue-600 hover:underline mb-4 block"
          >
            ← Kembali ke Kursus
          </Link>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Kehadiran — {course.title}</h1>
            <Link
              href={`/${ipt_slug}/courses/${courseId}/attendance/new`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Cipta Sesi
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="text-gray-500">Tiada sesi kehadiran lagi.</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/${ipt_slug}/courses/${courseId}/attendance/${session.id}`}
                    className="block rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-900">{session.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {new Date(session.session_date).toLocaleDateString('ms-MY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    )
  }

  // Ahli view: show own attendance history
  const history = await getUserAttendanceHistory(user.id, courseId)
  const presentCount = history.filter((r) => r.status === 'present').length
  const percentage = history.length > 0 ? Math.round((presentCount / history.length) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke Kursus
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kehadiran Saya — {course.title}</h1>

        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6">
          <p className="text-sm text-gray-500">Peratusan Kehadiran</p>
          <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {presentCount} hadir daripada {history.length} sesi
          </p>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500">Tiada rekod kehadiran lagi.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4"
              >
                <div>
                  <div className="font-medium text-gray-900">{record.session?.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {record.session?.session_date
                      ? new Date(record.session.session_date).toLocaleDateString('ms-MY', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    record.status === 'present'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {record.status === 'present' ? 'Hadir' : 'Tidak Hadir'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
