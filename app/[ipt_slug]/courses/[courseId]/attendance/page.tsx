import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import {
  getSessionsByCourse,
  getUserAttendanceHistory,
  getCourseAttendanceSummary,
} from '@/lib/attendance'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { AttendanceStatusType } from '@/lib/types'

const STATUS_CONFIG: Record<
  AttendanceStatusType,
  { label: string; short: string; color: string; bg: string; text: string }
> = {
  present: {
    label: 'Hadir',
    short: 'P',
    color: 'bg-green-500',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  absent: {
    label: 'Tidak Hadir',
    short: 'A',
    color: 'bg-red-500',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  late: {
    label: 'Lewat',
    short: 'L',
    color: 'bg-amber-500',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  excused: {
    label: 'Dimaafkan',
    short: 'E',
    color: 'bg-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
}

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
    return <StaffView iptSlug={ipt_slug} courseId={courseId} courseTitle={course.title} />
  }

  return <StudentView iptSlug={ipt_slug} courseId={courseId} courseTitle={course.title} userId={user.id} />
}

// ---------- Staff View ----------

async function StaffView({
  iptSlug,
  courseId,
  courseTitle,
}: {
  iptSlug: string
  courseId: string
  courseTitle: string
}) {
  const summary = await getCourseAttendanceSummary(courseId)

  // Compute overall totals
  const totals = summary.reduce(
    (acc, s) => ({
      present: acc.present + s.stats.present,
      absent: acc.absent + s.stats.absent,
      late: acc.late + s.stats.late,
      excused: acc.excused + s.stats.excused,
      total: acc.total + s.stats.total,
    }),
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/${iptSlug}/courses/${courseId}`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Kembali ke Kursus
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kehadiran &mdash; {courseTitle}</h1>
          <Link
            href={`/${iptSlug}/courses/${courseId}/attendance/new`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Tambah Sesi
          </Link>
        </div>

        {/* Summary cards */}
        {totals.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {(Object.keys(STATUS_CONFIG) as AttendanceStatusType[]).map((status) => {
              const cfg = STATUS_CONFIG[status]
              const count = totals[status]
              const pct = totals.total > 0 ? Math.round((count / totals.total) * 100) : 0
              return (
                <div
                  key={status}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center"
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm mb-2 ${cfg.color}`}
                  >
                    {cfg.short}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">
                    {cfg.label} ({pct}%)
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Sessions table */}
        {summary.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Tiada sesi kehadiran lagi.</p>
            <p className="text-sm text-gray-400 mt-1">
              Klik &quot;Tambah Sesi&quot; untuk mencipta sesi pertama.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Tarikh</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Tajuk</th>
                    <th className="text-center px-3 py-3 font-semibold text-green-700" title="Hadir">
                      P
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-red-700" title="Tidak Hadir">
                      A
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-amber-700" title="Lewat">
                      L
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-blue-700" title="Dimaafkan">
                      E
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(s.session_date).toLocaleDateString('ms-MY', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{s.title}</td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center justify-center min-w-[28px] rounded-full bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5">
                          {s.stats.present}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center justify-center min-w-[28px] rounded-full bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5">
                          {s.stats.absent}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center justify-center min-w-[28px] rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5">
                          {s.stats.late}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center justify-center min-w-[28px] rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5">
                          {s.stats.excused}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <Link
                          href={`/${iptSlug}/courses/${courseId}/attendance/${s.id}`}
                          className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          Tanda Kehadiran
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// ---------- Student View ----------

async function StudentView({
  iptSlug,
  courseId,
  courseTitle,
  userId,
}: {
  iptSlug: string
  courseId: string
  courseTitle: string
  userId: string
}) {
  const history = await getUserAttendanceHistory(userId, courseId)

  const counts: Record<AttendanceStatusType, number> = { present: 0, absent: 0, late: 0, excused: 0 }
  for (const r of history) {
    counts[r.status]++
  }
  const totalSessions = history.length
  const presentEquiv = counts.present + counts.late + counts.excused
  const percentage = totalSessions > 0 ? Math.round((presentEquiv / totalSessions) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${iptSlug}/courses/${courseId}`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Kembali ke Kursus
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Kehadiran Saya &mdash; {courseTitle}
        </h1>

        {/* Summary card with progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Peratusan Kehadiran</p>
            <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Breakdown row */}
          <div className="flex flex-wrap gap-4 text-sm">
            {(Object.keys(STATUS_CONFIG) as AttendanceStatusType[]).map((status) => {
              const cfg = STATUS_CONFIG[status]
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${cfg.color}`}
                  >
                    {cfg.short}
                  </span>
                  <span className="text-gray-600">
                    {cfg.label}: <span className="font-semibold">{counts[status]}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Petunjuk Status</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" /> P = Hadir
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" /> A = Tidak Hadir
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> L = Lewat
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> E = Dimaafkan
            </span>
          </div>
        </div>

        {/* Attendance table */}
        {history.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Tiada rekod kehadiran lagi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Tarikh</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Tajuk</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((record) => {
                    const cfg = STATUS_CONFIG[record.status]
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {record.session?.session_date
                            ? new Date(record.session.session_date).toLocaleDateString('ms-MY', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {record.session?.title}
                        </td>
                        <td className="text-center px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                          >
                            {cfg.short} &middot; {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {record.remark || '\u2014'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
