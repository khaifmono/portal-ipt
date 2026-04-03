import { NextRequest, NextResponse } from 'next/server'
import { createQuiz, addQuestion } from '@/lib/quizzes'
import { getUser } from '@/lib/auth'
import { getIptBySlug } from '@/lib/ipt'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string }> }
) {
  try {
    const { ipt_slug, courseId, weekId } = await params

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
    }

    const ipt = await getIptBySlug(ipt_slug)
    if (!ipt) {
      return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
    }

    // Check role from session
    if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(user.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, timerMinutes, randomizeQuestions, questions } = body

    if (!title) {
      return NextResponse.json({ error: 'Tajuk kuiz diperlukan' }, { status: 400 })
    }

    // Create quiz
    const quiz = await createQuiz({
      weekId,
      courseId,
      iptId: ipt.id,
      title,
      description: description ?? undefined,
      timerMinutes: timerMinutes ?? undefined,
      randomizeQuestions: randomizeQuestions ?? false,
      createdBy: user.id,
    })

    // Add questions
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await addQuestion({
          quizId: quiz.id,
          iptId: ipt.id,
          questionText: q.question_text,
          questionType: q.question_type,
          options: q.options ?? undefined,
          correctAnswer: q.correct_answer ?? undefined,
          marks: q.marks ?? 1,
          orderIndex: i,
        })
      }
    }

    return NextResponse.json({ quiz }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak dijangka'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
