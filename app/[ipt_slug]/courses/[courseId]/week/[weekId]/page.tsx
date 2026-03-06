import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
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

  // Get user role
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .eq('ipt_id', ipt.id)
    .single()

  const role = dbUser?.role ?? 'ahli'
  const canManage = ['admin', 'super_admin', 'tenaga_pengajar'].includes(role)

  // Fetch quizzes for this week
  let quizzes: Awaited<ReturnType<typeof getQuizzesByWeek>> = []
  try {
    quizzes = await getQuizzesByWeek(weekId)
  } catch {
    // If table doesn't exist yet (pre-migration), fail gracefully
    quizzes = []
  }

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

        {/* Quizzes Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Kuiz</h2>
            {canManage && (
              <Link
                href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/new`}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Kuiz Baharu
              </Link>
            )}
          </div>

          {quizzes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {canManage
                  ? 'Belum ada kuiz. Klik "+ Kuiz Baharu" untuk mencipta kuiz pertama.'
                  : 'Tiada kuiz untuk minggu ini.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/${quiz.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-900">{quiz.title}</p>
                    {quiz.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                        {quiz.description}
                      </p>
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
        </section>
      </div>
    </main>
  )
}
