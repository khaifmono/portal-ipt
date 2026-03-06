import { createClient } from '@/lib/supabase/server'
import type { Quiz, QuizQuestion } from '@/lib/types'

export async function getQuizzesByWeek(weekId: string): Promise<Quiz[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('week_id', weekId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
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

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      week_id: params.weekId,
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      timer_minutes: params.timerMinutes ?? null,
      randomize_questions: params.randomizeQuestions ?? false,
      created_by: params.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data
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

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({
      quiz_id: params.quizId,
      ipt_id: params.iptId,
      question_text: params.questionText,
      question_type: params.questionType,
      options: params.options ?? null,
      correct_answer: params.correctAnswer ?? null,
      marks: params.marks ?? 1,
      order_index: params.orderIndex,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getQuestionsByQuiz(quizId: string): Promise<QuizQuestion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data ?? []
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
