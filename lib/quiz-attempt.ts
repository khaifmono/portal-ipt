import { createClient } from '@/lib/supabase/server'
import type { QuizAttempt, QuizQuestion } from '@/lib/types'

/**
 * Pure helper: grades a single answer against a question.
 * - multiple_choice / true_false: case-insensitive string compare → marks or 0
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

/**
 * Computes the total auto-grade score for an attempt.
 * short_answer questions are skipped (score remains null until manually graded).
 * Returns the total score for auto-gradeable questions.
 * If any short_answer question exists, updates DB score to null (pending).
 */
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

  const supabase = await createClient()
  const { error } = await supabase
    .from('quiz_attempts')
    .update({ score: hasPending ? null : total })
    .eq('id', attemptId)

  if (error) throw error

  return hasPending ? -1 : total
}

/**
 * Start a quiz attempt for a user.
 * - Throws if the user already has a submitted attempt.
 * - Returns existing in_progress attempt if one exists.
 * - Otherwise creates a new in_progress attempt.
 */
export async function startAttempt(
  quizId: string,
  userId: string,
  iptId: string
): Promise<QuizAttempt> {
  const supabase = await createClient()

  // Check for existing attempt
  const { data: existing, error: fetchError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  if (existing) {
    if (existing.status === 'submitted') {
      throw new Error('Anda telah menghantar kuiz ini')
    }
    return existing as QuizAttempt
  }

  // Create new attempt
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: userId,
      ipt_id: iptId,
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) throw error
  return data as QuizAttempt
}

/**
 * Submit a quiz attempt.
 * - Saves answers and sets status to 'submitted'.
 * - Calls autoGrade() internally.
 */
export async function submitAttempt(
  attemptId: string,
  answers: Record<string, string>
): Promise<QuizAttempt> {
  const supabase = await createClient()

  // Fetch attempt to get quiz_id
  const { data: attempt, error: fetchError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attemptId)
    .single()

  if (fetchError) throw fetchError

  // Mark as submitted
  const { data: updated, error: updateError } = await supabase
    .from('quiz_attempts')
    .update({
      answers,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    })
    .eq('id', attemptId)
    .select()
    .single()

  if (updateError) throw updateError

  // Fetch questions for grading
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', attempt.quiz_id)
    .order('order_index', { ascending: true })

  if (questionsError) throw questionsError

  await autoGrade(attemptId, questions as QuizQuestion[], answers)

  // Return the latest state
  const { data: final, error: finalError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attemptId)
    .single()

  if (finalError) throw finalError
  return final as QuizAttempt
}
