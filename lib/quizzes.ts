import { prisma } from '@/lib/db'
import type { Quiz, QuizQuestion } from '@/lib/types'

export async function getQuizzesByWeek(weekId: string): Promise<Quiz[]> {
  const data = await prisma.quiz.findMany({
    where: { week_id: weekId },
    orderBy: { created_at: 'asc' },
  })
  return data.map(serializeQuiz)
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const data = await prisma.quiz.findUnique({ where: { id: quizId } })
  return data ? serializeQuiz(data) : null
}

export async function createQuiz(params: {
  weekId: string
  courseId: string
  iptId: string
  title: string
  description?: string
  timerMinutes?: number
  randomizeQuestions?: boolean
  createdBy: string
}): Promise<Quiz> {
  if (
    params.timerMinutes !== undefined &&
    (params.timerMinutes <= 0 || !Number.isInteger(params.timerMinutes))
  ) {
    throw new Error('timerMinutes mesti integer positif')
  }

  const data = await prisma.quiz.create({
    data: {
      week_id: params.weekId,
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      timer_minutes: params.timerMinutes ?? null,
      randomize_questions: params.randomizeQuestions ?? false,
      created_by: params.createdBy,
    },
  })
  return serializeQuiz(data)
}

export async function addQuestion(params: {
  quizId: string
  iptId: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer?: string
  marks?: number
  orderIndex: number
}): Promise<QuizQuestion> {
  if (
    params.questionType === 'multiple_choice' &&
    (!params.options || params.options.length < 2)
  ) {
    throw new Error('Soalan pilihan berganda memerlukan sekurang-kurangnya 2 pilihan')
  }

  const data = await prisma.quizQuestion.create({
    data: {
      quiz_id: params.quizId,
      ipt_id: params.iptId,
      question_text: params.questionText,
      question_type: params.questionType,
      options: params.options ?? undefined,
      correct_answer: params.correctAnswer ?? null,
      marks: params.marks ?? 1,
      order_index: params.orderIndex,
    },
  })
  return serializeQuestion(data)
}

export async function getQuestionsByQuiz(quizId: string): Promise<QuizQuestion[]> {
  const data = await prisma.quizQuestion.findMany({
    where: { quiz_id: quizId },
    orderBy: { order_index: 'asc' },
  })
  return data.map(serializeQuestion)
}

/**
 * Pure Fisher-Yates shuffle — returns a new array, does not mutate the original.
 */
export function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const arr = [...questions]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function serializeQuiz(row: Record<string, unknown>): Quiz {
  return { ...(row as unknown as Quiz), created_at: (row.created_at as Date).toISOString() }
}

function serializeQuestion(row: Record<string, unknown>): QuizQuestion {
  return {
    ...(row as unknown as QuizQuestion),
    options: row.options as string[] | null,
  }
}
