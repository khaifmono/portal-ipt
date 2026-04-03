import { getIptBySlug } from '@/lib/ipt'
import { getCourseById, getWeeksByCourse } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getSchedulesByCourse } from '@/lib/schedule'
import { getAnnouncementsByCourse } from '@/lib/announcements'
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

  const [weeks, schedules, announcements] = await Promise.all([
    getWeeksByCourse(courseId),
    getSchedulesByCourse(courseId),
    getAnnouncementsByCourse(courseId),
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

      {/* Announcements */}
      {(announcements.length > 0 || isStaff) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Pengumuman
            </h2>
            {isStaff && (
              <Link
                href={`/${ipt_slug}/courses/${courseId}/announcements/new`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Pengumuman
              </Link>
            )}
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Tiada pengumuman.</p>
          ) : (
            <>
              <div className="space-y-3">
                {announcements.slice(0, 5).map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`rounded-lg border px-4 py-3 ${
                      announcement.is_pinned
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {announcement.is_pinned && (
                            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                            </svg>
                          )}
                          <h3 className="text-sm font-bold text-gray-900">{announcement.title}</h3>
                          {announcement.is_pinned && (
                            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Disematkan
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{announcement.content}</p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {new Date(announcement.created_at).toLocaleDateString('ms-MY', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {isStaff && (
                        <form
                          action={`/${ipt_slug}/courses/${courseId}/announcements/${announcement.id}/delete`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            title="Padam pengumuman"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {announcements.length > 5 && (
                <div className="mt-3 text-center">
                  <Link
                    href={`/${ipt_slug}/courses/${courseId}/announcements`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Lihat Semua ({announcements.length} pengumuman)
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
