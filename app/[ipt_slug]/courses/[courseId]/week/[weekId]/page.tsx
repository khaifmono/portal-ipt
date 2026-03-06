import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getAssignmentsByWeek } from '@/lib/assignments'
import { getQuizzesByWeek } from '@/lib/quizzes'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WeekPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; weekId: string }>
}) {
  const { ipt_slug, courseId, weekId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const supabase = await createClient()
  const { data: week, error } = await supabase
    .from('course_weeks')
    .select('*')
    .eq('id', weekId)
    .eq('course_id', courseId)
    .single()

  if (error || !week) notFound()

  // Get role from DB (authoritative), fall back to JWT metadata
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .eq('ipt_id', ipt.id)
    .single()

  const role = dbUser?.role ?? (user.user_metadata?.role as string | undefined) ?? 'ahli'
  const isStaff = ['admin', 'super_admin', 'tenaga_pengajar'].includes(role)

  const [assignments, quizzes] = await Promise.all([
    getAssignmentsByWeek(weekId),
    getQuizzesByWeek(weekId).catch(() => []),
  ])

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke {course.title}
        </Link>

        <div className="mb-6">
          <span className="text-sm text-blue-600 font-medium">Minggu {week.week_number}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{week.title}</h1>
          {week.description && <p className="text-gray-600 mt-2">{week.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="font-medium text-gray-900 mb-1">Bahan Pembelajaran</div>
            <p className="text-sm text-gray-500">PDF, video, pautan Google Drive / YouTube</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="font-medium text-gray-900 mb-1">Tugasan</div>
            <p className="text-sm text-gray-500">Hantar fail atau jawapan teks</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="font-medium text-gray-900 mb-1">Kuiz</div>
            <p className="text-sm text-gray-500">Pelbagai jenis soalan dengan pemasaan</p>
          </div>
        </div>

        {/* Assignments section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tugasan</h2>
            {isStaff && (
              <Link
                href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/new`}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Tugasan Baru
              </Link>
            )}
          </div>

          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500">Tiada tugasan untuk minggu ini.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {assignments.map((asgn) => {
                const isPastDue = asgn.due_date ? new Date() > new Date(asgn.due_date) : false
                return (
                  <li key={asgn.id} className="py-3">
                    <Link
                      href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/${asgn.id}`}
                      className="flex items-start justify-between gap-4 group"
                    >
                      <div>
                        <span className="font-medium text-gray-900 group-hover:text-blue-600">
                          {asgn.title}
                        </span>
                        {asgn.description && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                            {asgn.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">
                            {asgn.type === 'file_upload' ? 'Muat Naik Fail' : 'Jawapan Teks'}
                          </span>
                          <span className="text-xs text-gray-400">Markah Penuh: {asgn.max_score}</span>
                        </div>
                      </div>
                      {asgn.due_date && (
                        <span
                          className={`text-xs font-medium whitespace-nowrap mt-0.5 ${
                            isPastDue ? 'text-red-500' : 'text-green-700'
                          }`}
                        >
                          {isPastDue ? 'Tamat: ' : 'Tarikh Akhir: '}
                          {new Date(asgn.due_date).toLocaleDateString('ms-MY')}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Quizzes section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Kuiz</h2>
            {isStaff && (
              <Link
                href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/new`}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Kuiz Baharu
              </Link>
            )}
          </div>

          {quizzes.length === 0 ? (
            <p className="text-sm text-gray-500">
              {isStaff
                ? 'Belum ada kuiz. Klik "+ Kuiz Baharu" untuk mencipta kuiz pertama.'
                : 'Tiada kuiz untuk minggu ini.'}
            </p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/${quiz.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-900">{quiz.title}</p>
                    {quiz.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{quiz.description}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      {quiz.timer_minutes && <span>{quiz.timer_minutes} minit</span>}
                      {quiz.randomize_questions && <span>Soalan diacak</span>}
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm">Buka →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
