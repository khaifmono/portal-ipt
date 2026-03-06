import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getIptBySlug } from '@/lib/ipt'
import { getQuizById, getQuestionsByQuiz, shuffleQuestions } from '@/lib/quizzes'
import { startAttempt } from '@/lib/quiz-attempt'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string; quizId: string }> }
) {
  try {
    const { ipt_slug, quizId } = await params

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
    }

    const ipt = await getIptBySlug(ipt_slug)
    if (!ipt) {
      return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
    }

    // Verify user belongs to this IPT
    const supabase = await createClient()
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .eq('ipt_id', ipt.id)
      .single()

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'Pengguna tidak dijumpai' }, { status: 404 })
    }

    const quiz = await getQuizById(quizId)
    if (!quiz || quiz.ipt_id !== ipt.id) {
      return NextResponse.json({ error: 'Kuiz tidak dijumpai' }, { status: 404 })
    }

    const attempt = await startAttempt(quizId, user.id, ipt.id)

    let questions = await getQuestionsByQuiz(quizId)
    if (quiz.randomize_questions) {
      questions = shuffleQuestions(questions)
    }

    // Strip correct_answer from questions sent to client
    const clientQuestions = questions.map(({ correct_answer: _ca, ...q }) => q)

    return NextResponse.json({
      attemptId: attempt.id,
      questions: clientQuestions,
      timerSeconds: quiz.timer_minutes ? quiz.timer_minutes * 60 : null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak dijangka'
    const status = message.includes('menghantar') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
