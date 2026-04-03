import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getQuizById, getQuestionsByQuiz } from '@/lib/quizzes'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function QuizReviewPage({
  params,
}: {
  params: Promise<{
    ipt_slug: string
    courseId: string
    weekId: string
    quizId: string
  }>
}) {
  const { ipt_slug, courseId, weekId, quizId } = await params

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const week = await prisma.courseWeek.findFirst({
    where: { id: weekId, course_id: courseId },
  })
  if (!week) notFound()

  const quiz = await getQuizById(quizId)
  if (!quiz || quiz.ipt_id !== ipt.id) notFound()

  // Fetch the user's submitted attempt
  const attempt = await prisma.quizAttempt.findFirst({
    where: { quiz_id: quizId, user_id: user.id, status: 'submitted' },
  })

  if (!attempt) {
    // No submitted attempt — redirect back to the quiz page
    redirect(`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/${quizId}`)
  }

  const questions = await getQuestionsByQuiz(quizId)
  const answers = (attempt.answers as Record<string, string>) ?? {}

  // Calculate total marks available
  const totalMarksAvailable = questions.reduce((sum, q) => sum + q.marks, 0)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/${quizId}`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          &larr; Kembali ke Kuiz
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{quiz.title}</h1>
          <p className="text-gray-500 text-sm">Semakan Jawapan</p>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const studentAnswer = answers[q.id] ?? ''
            const isShortAnswer = q.question_type === 'short_answer'
            const isCorrect =
              !isShortAnswer &&
              q.correct_answer !== null &&
              studentAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
            const isUnanswered = !studentAnswer.trim()
            const marksEarned = isShortAnswer
              ? null
              : isCorrect
                ? q.marks
                : 0

            return (
              <div
                key={q.id}
                className={`rounded-lg border p-5 shadow-sm ${
                  isUnanswered
                    ? 'bg-gray-50 border-gray-200'
                    : isShortAnswer
                      ? 'bg-blue-50 border-blue-200'
                      : isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                }`}
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm text-gray-500">
                    Soalan {i + 1} &mdash; {q.marks} markah
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {isUnanswered ? (
                      <span className="text-sm text-gray-400 font-medium">&mdash;</span>
                    ) : isShortAnswer ? (
                      <span className="text-sm text-blue-600 font-medium">Penilaian manual</span>
                    ) : isCorrect ? (
                      <span className="text-lg text-green-600" aria-label="Betul">&#10003;</span>
                    ) : (
                      <span className="text-lg text-red-600" aria-label="Salah">&#10007;</span>
                    )}
                    {marksEarned !== null && (
                      <span className="text-sm font-semibold text-gray-700">
                        {marksEarned}/{q.marks}
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-medium text-gray-900 mb-3">{q.question_text}</p>

                {/* MCQ / True-False: show options with highlighting */}
                {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') &&
                  q.options && (
                    <ul className="space-y-2">
                      {(q.options as string[]).filter(Boolean).map((opt) => {
                        const isStudentChoice =
                          studentAnswer.trim().toLowerCase() === opt.trim().toLowerCase()
                        const isCorrectOption =
                          q.correct_answer !== null &&
                          q.correct_answer.trim().toLowerCase() === opt.trim().toLowerCase()

                        let optionClasses = 'rounded-md px-3 py-2 text-sm border '
                        if (isCorrectOption && isStudentChoice) {
                          // Student chose the correct answer
                          optionClasses +=
                            'bg-green-100 border-green-300 text-green-900 font-medium'
                        } else if (isCorrectOption) {
                          // The correct answer (student didn't pick this)
                          optionClasses +=
                            'bg-green-100 border-green-300 text-green-900 font-medium'
                        } else if (isStudentChoice) {
                          // Student's wrong choice
                          optionClasses += 'bg-red-100 border-red-300 text-red-900'
                        } else {
                          optionClasses += 'bg-white border-gray-200 text-gray-600'
                        }

                        return (
                          <li key={opt} className={optionClasses}>
                            <div className="flex items-center justify-between">
                              <span>{opt}</span>
                              <span className="text-xs shrink-0 ml-2">
                                {isCorrectOption && isStudentChoice && (
                                  <span className="text-green-700">&#10003; Jawapan anda (betul)</span>
                                )}
                                {isCorrectOption && !isStudentChoice && (
                                  <span className="text-green-700">&#10003; Jawapan betul</span>
                                )}
                                {isStudentChoice && !isCorrectOption && (
                                  <span className="text-red-700">&#10007; Jawapan anda</span>
                                )}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                {/* Short answer: show student's answer */}
                {q.question_type === 'short_answer' && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Jawapan anda:</p>
                      <div className="rounded-md bg-white border border-gray-200 px-3 py-2 text-sm text-gray-700">
                        {studentAnswer || <span className="text-gray-400 italic">Tidak dijawab</span>}
                      </div>
                    </div>
                    {q.correct_answer && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Jawapan cadangan:</p>
                        <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 font-medium">
                          {q.correct_answer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Total score */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Jumlah Markah</h2>
            <p className="text-3xl font-bold text-blue-600">
              {attempt.score !== null ? (
                <>
                  {Number(attempt.score)}
                  <span className="text-lg text-gray-400 font-normal">
                    /{totalMarksAvailable}
                  </span>
                </>
              ) : (
                <span className="text-lg text-gray-500 font-normal">
                  Belum dinilai sepenuhnya
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
