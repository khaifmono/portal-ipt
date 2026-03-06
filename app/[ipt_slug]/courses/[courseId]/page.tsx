import { getIptBySlug } from '@/lib/ipt'
import { getCourseById, getWeeksByCourse } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getSchedulesByCourse } from '@/lib/schedule'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const [weeks, schedules] = await Promise.all([
    getWeeksByCourse(courseId),
    getSchedulesByCourse(courseId),
  ])

  // Only show upcoming schedules (start_time >= now)
  const now = new Date()
  const upcomingSchedules = schedules.filter((s) => new Date(s.start_time) >= now)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href={`/${ipt_slug}/courses`} className="text-sm text-blue-600 hover:underline mb-4 block">
          ← Kembali ke Kursus
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        {course.description && <p className="text-gray-600 mb-8">{course.description}</p>}

        {/* Upcoming schedules section */}
        {upcomingSchedules.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Kelas Akan Datang</h2>
            <ul className="space-y-2">
              {upcomingSchedules.slice(0, 3).map((schedule) => {
                const start = new Date(schedule.start_time)
                const end = new Date(schedule.end_time)
                return (
                  <li
                    key={schedule.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{schedule.title}</div>
                      {schedule.location && (
                        <div className="text-xs text-gray-500 mt-0.5">{schedule.location}</div>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>
                        {start.toLocaleDateString('ms-MY', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div>
                        {start.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {end.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Attendance link */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Kehadiran</h2>
          </div>
          <Link
            href={`/${ipt_slug}/courses/${courseId}/attendance`}
            className="block rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <span className="text-blue-600 font-medium text-sm">Lihat Rekod Kehadiran →</span>
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Minggu Pembelajaran</h2>

        {weeks.length === 0 ? (
          <p className="text-gray-500">Tiada minggu pembelajaran lagi.</p>
        ) : (
          <ul className="space-y-2">
            {weeks.map((week) => (
              <li key={week.id}>
                <Link
                  href={`/${ipt_slug}/courses/${courseId}/week/${week.id}`}
                  className="block rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-blue-600 font-medium">Minggu {week.week_number}</span>
                  <div className="font-medium text-gray-900 mt-0.5">{week.title}</div>
                  {week.description && (
                    <div className="text-sm text-gray-500 mt-1">{week.description}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
