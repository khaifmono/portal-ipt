import { getIptBySlug } from '@/lib/ipt'
import { getCoursesByIpt } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getSchedulesByIpt } from '@/lib/schedule'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Course } from '@/lib/types'

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const [schedules, courses] = await Promise.all([
    getSchedulesByIpt(ipt.id),
    getCoursesByIpt(ipt.id),
  ])

  const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]))

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadual Kelas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ipt.name}</p>
        </div>
        <Link
          href={`/${ipt_slug}/admin/schedule/new`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Cipta Jadual
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Tiada jadual lagi.</p>
          <p className="text-gray-400 text-sm mt-1">Klik &quot;+ Cipta Jadual&quot; untuk bermula.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const course = courseMap.get(schedule.course_id)
            const start = new Date(schedule.start_time)
            const end = new Date(schedule.end_time)
            const isPast = end < new Date()
            return (
              <div key={schedule.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-blue-700 text-xs font-bold leading-none">
                      {start.toLocaleDateString('ms-MY', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-blue-900 text-lg font-black leading-none">
                      {start.getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{schedule.title}</p>
                    {course && <p className="text-xs text-blue-600 mt-0.5">{course.title}</p>}
                    {schedule.location && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {schedule.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">
                    {start.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {end.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5">
                    {schedule.recurring && (
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-semibold">Berulang</span>
                    )}
                    {isPast && (
                      <span className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-[10px] font-semibold">Selesai</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
