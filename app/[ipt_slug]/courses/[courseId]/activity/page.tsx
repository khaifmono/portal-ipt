import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { getActivityLog } from '@/lib/activity-log'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'baru sahaja'
  if (diffMin < 60) return `${diffMin} minit lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay < 7) return `${diffDay} hari lalu`
  return date.toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function roleLabel(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin'
    case 'admin':
      return 'Penyelia'
    case 'tenaga_pengajar':
      return 'Tenaga Pengajar'
    case 'ahli':
      return 'Ahli'
    default:
      return role
  }
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  // Staff only
  if (!['super_admin', 'admin', 'tenaga_pengajar'].includes(user.role)) {
    redirect(`/${ipt_slug}/courses/${courseId}`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const logs = await getActivityLog(courseId)

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${ipt_slug}/courses`} className="hover:text-blue-600 transition-colors">
          Kursus Saya
        </Link>
        <span>/</span>
        <Link
          href={`/${ipt_slug}/courses/${courseId}`}
          className="hover:text-blue-600 transition-colors"
        >
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Log Aktiviti</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Log Aktiviti
          </h1>
          <p className="text-blue-200 text-sm mt-1">{course.title}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-500">Tiada aktiviti direkodkan lagi.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />

                  <div className="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{log.user.nama}</span>
                          <span className="text-xs text-gray-400 ml-1.5">
                            ({roleLabel(log.user.role)})
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 mt-0.5">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        {timeAgo(new Date(log.created_at))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
