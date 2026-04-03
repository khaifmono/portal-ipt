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

  const now = new Date()
  const upcomingSchedules = schedules.filter((s) => new Date(s.start_time) >= now)

  const isStaff = ['super_admin', 'admin', 'tenaga_pengajar'].includes(user.role)

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${ipt_slug}/courses`} className="hover:text-blue-600 transition-colors">
          Kursus Saya
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{course.title}</span>
      </nav>

      {/* Course header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-8">
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          {course.description && (
            <p className="text-blue-200 mt-2 text-sm">{course.description}</p>
          )}
        </div>
        <div className="flex items-center gap-6 px-6 py-3 border-t border-gray-100 bg-gray-50">
          <Link
            href={`/${ipt_slug}/courses/${courseId}/attendance`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Rekod Kehadiran
          </Link>
          <span className="text-gray-300">|</span>
          {isStaff ? (
            <Link
              href={`/${ipt_slug}/courses/${courseId}/gradebook`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Buku Gred
            </Link>
          ) : (
            <Link
              href={`/${ipt_slug}/courses/${courseId}/grades`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Markah Saya
            </Link>
          )}
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">{weeks.length} minggu pembelajaran</span>
        </div>
      </div>

      {/* Upcoming schedules */}
      {upcomingSchedules.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Kelas Akan Datang
          </h2>
          <div className="space-y-2">
            {upcomingSchedules.slice(0, 3).map((schedule) => {
              const start = new Date(schedule.start_time)
              const end = new Date(schedule.end_time)
              return (
                <div key={schedule.id} className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                    {schedule.location && (
                      <p className="text-xs text-gray-500 mt-0.5">{schedule.location}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p className="font-medium text-gray-700">
                      {start.toLocaleDateString('ms-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p>
                      {start.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {end.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weeks */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Minggu Pembelajaran</h2>
        {weeks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Tiada minggu pembelajaran lagi.</p>
        ) : (
          <div className="space-y-2">
            {weeks.map((week) => (
              <Link
                key={week.id}
                href={`/${ipt_slug}/courses/${courseId}/week/${week.id}`}
                className="flex items-center gap-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 px-4 py-3.5 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                  <span className="text-xs font-bold text-blue-700 group-hover:text-white transition-colors">
                    {week.week_number}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{week.title}</p>
                  {week.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{week.description}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-blue-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
