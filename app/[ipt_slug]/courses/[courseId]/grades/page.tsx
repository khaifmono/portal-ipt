import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

function gradeColor(percentage: number | null): string {
  if (percentage === null) return 'text-gray-400'
  if (percentage >= 80) return 'text-green-700 bg-green-50'
  if (percentage >= 50) return 'text-amber-700 bg-amber-50'
  return 'text-red-700 bg-red-50'
}

function statusLabel(graded: boolean, submitted: boolean): { text: string; color: string } {
  if (graded) return { text: 'Dinilai', color: 'text-green-700 bg-green-50' }
  if (submitted) return { text: 'Dihantar', color: 'text-blue-700 bg-blue-50' }
  return { text: 'Belum dihantar', color: 'text-gray-500 bg-gray-100' }
}

export default async function StudentGradesPage({
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

  const userId = user.id

  // Fetch student's data in parallel
  const [assignments, quizzes, submissions, quizAttempts, quizQuestions] =
    await Promise.all([
      prisma.assignment.findMany({
        where: { course_id: courseId },
        orderBy: { created_at: 'asc' },
      }),
      prisma.quiz.findMany({
        where: { course_id: courseId },
        orderBy: { created_at: 'asc' },
      }),
      prisma.submission.findMany({
        where: { user_id: userId, assignment: { course_id: courseId } },
      }),
      prisma.quizAttempt.findMany({
        where: { user_id: userId, quiz: { course_id: courseId } },
      }),
      prisma.quizQuestion.findMany({
        where: { quiz: { course_id: courseId } },
      }),
    ])

  // Build lookup maps
  const submissionByAssignment = new Map(
    submissions.map((s) => [s.assignment_id, s])
  )
  const attemptByQuiz = new Map(quizAttempts.map((a) => [a.quiz_id, a]))

  // Quiz max scores
  const quizMaxScores = new Map<string, number>()
  for (const q of quizQuestions) {
    quizMaxScores.set(q.quiz_id, (quizMaxScores.get(q.quiz_id) ?? 0) + q.marks)
  }

  // Build grade items
  type GradeItem = {
    name: string
    type: 'Tugasan' | 'Kuiz'
    score: number | null
    maxScore: number
    percentage: number | null
    submitted: boolean
    graded: boolean
  }

  const gradeItems: GradeItem[] = []

  for (const a of assignments) {
    const sub = submissionByAssignment.get(a.id)
    const grade = sub?.grade !== null && sub?.grade !== undefined ? Number(sub.grade) : null
    const pct = grade !== null && a.max_score > 0 ? (grade / a.max_score) * 100 : null

    gradeItems.push({
      name: a.title,
      type: 'Tugasan',
      score: grade,
      maxScore: a.max_score,
      percentage: pct,
      submitted: !!sub,
      graded: grade !== null,
    })
  }

  for (const q of quizzes) {
    const att = attemptByQuiz.get(q.id)
    const maxScore = quizMaxScores.get(q.id) ?? 0
    const score =
      att?.score !== null && att?.score !== undefined ? Number(att.score) : null
    const pct = score !== null && maxScore > 0 ? (score / maxScore) * 100 : null
    const submitted = att?.status === 'submitted'

    gradeItems.push({
      name: q.title,
      type: 'Kuiz',
      score,
      maxScore,
      percentage: pct,
      submitted,
      graded: score !== null,
    })
  }

  // Overall average
  const gradedPercentages = gradeItems
    .map((g) => g.percentage)
    .filter((p): p is number => p !== null)
  const overallAverage =
    gradedPercentages.length > 0
      ? gradedPercentages.reduce((a, b) => a + b, 0) / gradedPercentages.length
      : null

  const hasItems = gradeItems.length > 0

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
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
        <span className="text-gray-800 font-medium">Markah Saya</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Markah Saya</h1>
        <p className="text-sm text-gray-500 mt-1">{course.title}</p>
      </div>

      {/* Overall average card */}
      {overallAverage !== null && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Purata Keseluruhan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overallAverage.toFixed(1)}%
              </p>
            </div>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${gradeColor(overallAverage)}`}
            >
              {overallAverage >= 80 ? 'A' : overallAverage >= 65 ? 'B' : overallAverage >= 50 ? 'C' : 'D'}
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                overallAverage >= 80
                  ? 'bg-green-500'
                  : overallAverage >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(overallAverage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Grades table */}
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
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Tugasan / Kuiz
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Jenis
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Markah
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Markah Penuh
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Peratus
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gradeItems.map((item, idx) => {
                const status = statusLabel(item.graded, item.submitted)
                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                          item.type === 'Tugasan'
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-purple-700 bg-purple-50'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.score !== null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${gradeColor(item.percentage)}`}
                        >
                          {Number(item.score)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.maxScore}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.percentage !== null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${gradeColor(item.percentage)}`}
                        >
                          {item.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary footer */}
      {hasItems && (
        <div className="mt-4 text-xs text-gray-500">
          <span>
            Jumlah item: <strong>{gradeItems.length}</strong>
          </span>
          <span className="ml-4">
            Dinilai: <strong>{gradeItems.filter((g) => g.graded).length}</strong>
          </span>
          <span className="ml-4">
            Belum dihantar:{' '}
            <strong>{gradeItems.filter((g) => !g.submitted).length}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
