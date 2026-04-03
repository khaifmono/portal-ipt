import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const STAFF_ROLES = ['super_admin', 'admin', 'tenaga_pengajar'] as const

function gradeColor(grade: number | null): string {
  if (grade === null) return 'text-gray-400'
  if (grade >= 80) return 'text-green-700 bg-green-50'
  if (grade >= 50) return 'text-amber-700 bg-amber-50'
  return 'text-red-700 bg-red-50'
}

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  if (!STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
    redirect(`/${ipt_slug}/courses/${courseId}`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  // Fetch all data in parallel
  const [enrollments, assignments, quizzes, submissions, quizAttempts, quizQuestions] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { course_id: courseId },
        include: { user: true },
        orderBy: { user: { nama: 'asc' } },
      }),
      prisma.assignment.findMany({
        where: { course_id: courseId },
        orderBy: { created_at: 'asc' },
      }),
      prisma.quiz.findMany({
        where: { course_id: courseId },
        orderBy: { created_at: 'asc' },
      }),
      prisma.submission.findMany({
        where: { assignment: { course_id: courseId } },
      }),
      prisma.quizAttempt.findMany({
        where: { quiz: { course_id: courseId }, status: 'submitted' },
      }),
      prisma.quizQuestion.findMany({
        where: { quiz: { course_id: courseId } },
      }),
    ])

  // Build lookup maps
  // submission: assignmentId -> userId -> grade
  const submissionMap = new Map<string, Map<string, number | null>>()
  for (const sub of submissions) {
    if (!submissionMap.has(sub.assignment_id)) {
      submissionMap.set(sub.assignment_id, new Map())
    }
    submissionMap
      .get(sub.assignment_id)!
      .set(sub.user_id, sub.grade !== null ? Number(sub.grade) : null)
  }

  // quiz max scores: quizId -> sum of marks
  const quizMaxScores = new Map<string, number>()
  for (const q of quizQuestions) {
    quizMaxScores.set(q.quiz_id, (quizMaxScores.get(q.quiz_id) ?? 0) + q.marks)
  }

  // quizAttempt: quizId -> userId -> score
  const attemptMap = new Map<string, Map<string, number | null>>()
  for (const att of quizAttempts) {
    if (!attemptMap.has(att.quiz_id)) {
      attemptMap.set(att.quiz_id, new Map())
    }
    attemptMap
      .get(att.quiz_id)!
      .set(att.user_id, att.score !== null ? Number(att.score) : null)
  }

  // Calculate percentage for each student per item
  type GradeCell = { raw: number | null; maxScore: number; percentage: number | null }

  function getStudentGrades(userId: string): {
    assignmentGrades: GradeCell[]
    quizGrades: GradeCell[]
    average: number | null
  } {
    const assignmentGrades: GradeCell[] = assignments.map((a) => {
      const grade = submissionMap.get(a.id)?.get(userId) ?? undefined
      if (grade === undefined) {
        return { raw: null, maxScore: a.max_score, percentage: null }
      }
      if (grade === null) {
        // Submitted but not yet graded
        return { raw: null, maxScore: a.max_score, percentage: null }
      }
      const pct = a.max_score > 0 ? (grade / a.max_score) * 100 : 0
      return { raw: grade, maxScore: a.max_score, percentage: pct }
    })

    const quizGrades: GradeCell[] = quizzes.map((q) => {
      const score = attemptMap.get(q.id)?.get(userId) ?? undefined
      const maxScore = quizMaxScores.get(q.id) ?? 0
      if (score === undefined) {
        return { raw: null, maxScore, percentage: null }
      }
      if (score === null) {
        return { raw: null, maxScore, percentage: null }
      }
      const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
      return { raw: score, maxScore, percentage: pct }
    })

    const allPercentages = [...assignmentGrades, ...quizGrades]
      .map((g) => g.percentage)
      .filter((p): p is number => p !== null)

    const average =
      allPercentages.length > 0
        ? allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length
        : null

    return { assignmentGrades, quizGrades, average }
  }

  const hasItems = assignments.length > 0 || quizzes.length > 0

  return (
    <div className="max-w-full mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href={`/${ipt_slug}/courses`}
          className="hover:text-blue-600 transition-colors"
        >
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
        <span className="text-gray-800 font-medium">Buku Gred</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buku Gred</h1>
          <p className="text-sm text-gray-500 mt-1">{course.title}</p>
        </div>
        {hasItems && enrollments.length > 0 && (
          <a
            href={`/${ipt_slug}/courses/${courseId}/gradebook/export`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Eksport CSV
          </a>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {!hasItems ? (
          <div className="text-center py-16 px-4">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-sm">
              Tiada tugasan atau kuiz dalam kursus ini lagi.
            </p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16 px-4">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500 text-sm">
              Tiada pelajar didaftarkan dalam kursus ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                    No.
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap sticky left-12 bg-gray-50 z-10 min-w-[180px]">
                    Nama Pelajar
                  </th>
                  {assignments.map((a) => (
                    <th
                      key={a.id}
                      className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap"
                      title={a.title}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-blue-500 font-medium">
                          Tugasan
                        </span>
                        <span className="max-w-[120px] truncate">{a.title}</span>
                      </div>
                    </th>
                  ))}
                  {quizzes.map((q) => (
                    <th
                      key={q.id}
                      className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap"
                      title={q.title}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-purple-500 font-medium">
                          Kuiz
                        </span>
                        <span className="max-w-[120px] truncate">{q.title}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    Purata
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.map((enrollment, idx) => {
                  const { assignmentGrades, quizGrades, average } =
                    getStudentGrades(enrollment.user_id)
                  return (
                    <tr
                      key={enrollment.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 sticky left-0 bg-white z-10">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 sticky left-12 bg-white z-10">
                        {enrollment.user.nama}
                      </td>
                      {assignmentGrades.map((g, i) => (
                        <td key={assignments[i].id} className="px-4 py-3 text-center">
                          {g.raw !== null ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${gradeColor(g.percentage)}`}
                            >
                              {Number(g.raw)}/{g.maxScore}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      ))}
                      {quizGrades.map((g, i) => (
                        <td key={quizzes[i].id} className="px-4 py-3 text-center">
                          {g.raw !== null ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${gradeColor(g.percentage)}`}
                            >
                              {Number(g.raw)}/{g.maxScore}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        {average !== null ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${gradeColor(average)}`}
                          >
                            {average.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {hasItems && enrollments.length > 0 && (
        <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
          <span>
            Jumlah pelajar: <strong>{enrollments.length}</strong>
          </span>
          <span>
            Tugasan: <strong>{assignments.length}</strong>
          </span>
          <span>
            Kuiz: <strong>{quizzes.length}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
