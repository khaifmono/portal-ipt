import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getQuizById, getQuestionsByQuiz } from '@/lib/quizzes'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import QuizPlayer from './QuizPlayer'

export default async function QuizPage({
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

  const role = user.role ?? 'ahli'

  const quiz = await getQuizById(quizId)
  if (!quiz || quiz.ipt_id !== ipt.id) notFound()

  // Check for existing submitted attempt
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: { quiz_id: quizId, user_id: user.id },
  })

  const isAhli = role === 'ahli'

  // If already submitted, show score
  if (existingAttempt?.status === 'submitted') {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
            className="text-sm text-blue-600 hover:underline mb-6 block"
          >
            ← Kembali ke Minggu {week.week_number}
          </Link>

          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-500 text-sm mb-6">Anda telah menghantar kuiz ini.</p>
            {existingAttempt.score !== null ? (
              <div>
                <p className="text-gray-700 text-sm mb-1">Markah anda</p>
                <p className="text-4xl font-bold text-blue-600">{Number(existingAttempt.score)}</p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Markah anda sedang dinilai oleh pengajar. Sila semak semula nanti.
              </p>
            )}
          </div>
        </div>
      </main>
    )
  }

  // For ahli: start attempt and serve the quiz player
  if (isAhli) {
    // Start or retrieve in-progress attempt
    let activeAttempt = await prisma.quizAttempt.findFirst({
      where: { quiz_id: quizId, user_id: user.id },
    })

    if (!activeAttempt) {
      activeAttempt = await prisma.quizAttempt.create({
        data: {
          quiz_id: quizId,
          user_id: user.id,
          ipt_id: ipt.id,
          status: 'in_progress',
        },
      })
    }

    if (!activeAttempt) {
      return (
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-red-600">Ralat memulakan percubaan kuiz. Sila cuba lagi.</p>
          </div>
        </main>
      )
    }

    const questions = await getQuestionsByQuiz(quizId)
    const clientQuestions = questions.map(({ correct_answer: _ca, ...q }) => q)

    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
            className="text-sm text-blue-600 hover:underline mb-6 block"
          >
            ← Kembali ke Minggu {week.week_number}
          </Link>

          <QuizPlayer
            quizId={quizId}
            quizTitle={quiz.title}
            attemptId={activeAttempt.id}
            questions={clientQuestions}
            timerSeconds={quiz.timer_minutes ? quiz.timer_minutes * 60 : null}
            iptSlug={ipt_slug}
            courseId={courseId}
            weekId={weekId}
          />
        </div>
      </main>
    )
  }

  // For instructors/admins: show quiz info only
  const questions = await getQuestionsByQuiz(quizId)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          ← Kembali ke Minggu {week.week_number}
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              {questions.length} soalan
            </span>
            {quiz.timer_minutes && <span>Masa: {quiz.timer_minutes} minit</span>}
            {quiz.randomize_questions && <span>Soalan diacak</span>}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Soalan {i + 1} — {q.marks} markah</p>
              <p className="font-medium text-gray-900 mb-3">{q.question_text}</p>
              {q.options && (
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {(q.options as string[]).filter(Boolean).map((opt: string) => (
                    <li
                      key={opt}
                      className={opt === q.correct_answer ? 'text-green-700 font-medium' : ''}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
              {q.correct_answer && q.question_type !== 'multiple_choice' && (
                <p className="text-sm text-green-700 mt-2">
                  Jawapan: <span className="font-medium">{q.correct_answer}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
