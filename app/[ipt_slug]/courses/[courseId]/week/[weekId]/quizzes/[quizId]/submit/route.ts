import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { submitAttempt } from '@/lib/quiz-attempt'

export async function POST(
  request: NextRequest,
  { params: _params }: { params: Promise<{ ipt_slug: string; courseId: string; weekId: string; quizId: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
    }

    const body = await request.json()
    const { attemptId, answers } = body

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId diperlukan' }, { status: 400 })
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'answers diperlukan' }, { status: 400 })
    }

    const attempt = await submitAttempt(attemptId, answers as Record<string, string>)

    return NextResponse.json({ score: attempt.score, status: attempt.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak dijangka'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
