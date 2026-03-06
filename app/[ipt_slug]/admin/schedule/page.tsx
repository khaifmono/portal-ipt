import { getIptBySlug } from '@/lib/ipt'
import { getCoursesByIpt } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getSchedulesByIpt } from '@/lib/schedule'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()
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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${ipt_slug}/dashboard`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jadual Kelas</h1>
          <Link
            href={`/${ipt_slug}/admin/schedule/new`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Cipta Jadual
          </Link>
        </div>

        {schedules.length === 0 ? (
          <p className="text-gray-500">Tiada jadual lagi.</p>
        ) : (
          <ul className="space-y-3">
            {schedules.map((schedule) => {
              const course = courseMap.get(schedule.course_id)
              const start = new Date(schedule.start_time)
              const end = new Date(schedule.end_time)
              return (
                <li
                  key={schedule.id}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{schedule.title}</div>
                      {course && (
                        <div className="text-sm text-blue-600 mt-0.5">{course.title}</div>
                      )}
                      {schedule.location && (
                        <div className="text-sm text-gray-500 mt-0.5">{schedule.location}</div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
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
                      {schedule.recurring && (
                        <span className="inline-block mt-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
                          Berulang
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
