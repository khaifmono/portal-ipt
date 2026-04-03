import { prisma } from '@/lib/db'
import type { QuizAttempt, QuizQuestion } from '@/lib/types'

/**
 * Pure helper: grades a single answer against a question.
 * - multiple_choice / true_false: case-insensitive string compare -> marks or 0
 * - short_answer: always returns -1 (pending manual grading)
 */
export function scoreAnswer(question: QuizQuestion, answer: string): number {
  if (question.question_type === 'short_answer') {
    return -1
  }

  if (
    question.correct_answer !== null &&
    answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
  ) {
    return question.marks
  }

  return 0
}

export async function autoGrade(
  attemptId: string,
  questions: QuizQuestion[],
  answers: Record<string, string>
): Promise<number> {
  let total = 0
  let hasPending = false

  for (const q of questions) {
    const answer = answers[q.id] ?? ''
    const result = scoreAnswer(q, answer)
    if (result === -1) {
      hasPending = true
    } else {
      total += result
    }
  }

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { score: hasPending ? null : total },
  })

  return hasPending ? -1 : total
}

export async function startAttempt(
  quizId: string,
  userId: string,
  iptId: string
): Promise<QuizAttempt> {
  // Check for existing attempt
  const existing = await prisma.quizAttempt.findUnique({
    where: { quiz_id_user_id: { quiz_id: quizId, user_id: userId } },
  })

  if (existing) {
    if (existing.status === 'submitted') {
      throw new Error('Anda telah menghantar kuiz ini')
    }
    return serializeAttempt(existing)
  }

  const data = await prisma.quizAttempt.create({
    data: {
      quiz_id: quizId,
      user_id: userId,
      ipt_id: iptId,
      status: 'in_progress',
    },
  })

  return serializeAttempt(data)
}

export async function submitAttempt(
  attemptId: string,
  answers: Record<string, string>
): Promise<QuizAttempt> {
  // Fetch attempt to get quiz_id
  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt) throw new Error('Percubaan kuiz tidak dijumpai')

  // Mark as submitted
  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      submitted_at: new Date(),
      status: 'submitted',
    },
  })

  // Fetch questions for grading
  const questions = await prisma.quizQuestion.findMany({
    where: { quiz_id: attempt.quiz_id },
    orderBy: { order_index: 'asc' },
  })

  await autoGrade(
    attemptId,
    questions.map(serializeQuestion),
    answers
  )

  // Return the latest state
  const final = await prisma.quizAttempt.findUnique({ where: { id: attemptId } })
  if (!final) throw new Error('Percubaan kuiz tidak dijumpai')
  return serializeAttempt(final)
}

function serializeAttempt(row: Record<string, unknown>): QuizAttempt {
  return {
    ...(row as unknown as QuizAttempt),
    started_at: (row.started_at as Date).toISOString(),
    submitted_at: row.submitted_at ? (row.submitted_at as Date).toISOString() : null,
    score: row.score !== null && row.score !== undefined ? Number(row.score) : null,
    answers: (row.answers as Record<string, string>) ?? null,
  }
}

function serializeQuestion(row: Record<string, unknown>): QuizQuestion {
  return {
    ...(row as unknown as QuizQuestion),
    options: row.options as string[] | null,
  }
}
