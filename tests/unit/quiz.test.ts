import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server Supabase client before importing modules
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createQuiz, addQuestion, shuffleQuestions } from '@/lib/quizzes'
import { scoreAnswer } from '@/lib/quiz-attempt'
import { createClient } from '@/lib/supabase/server'
import type { QuizQuestion } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helper: build a minimal QuizQuestion
// ---------------------------------------------------------------------------
function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'q-1',
    quiz_id: 'quiz-1',
    ipt_id: 'ipt-1',
    question_text: 'What is 2+2?',
    question_type: 'multiple_choice',
    options: ['2', '4', '6', '8'],
    correct_answer: '4',
    marks: 2,
    order_index: 0,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// 3.4 — createQuiz validation
// ---------------------------------------------------------------------------
describe('createQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when timerMinutes is zero', async () => {
    await expect(
      createQuiz({
        weekId: 'week-1',
        courseId: 'course-1',
        iptId: 'ipt-1',
        title: 'Kuiz 1',
        timerMinutes: 0,
        createdBy: 'user-1',
      })
    ).rejects.toThrow('timerMinutes mesti integer positif')
  })

  it('throws when timerMinutes is negative', async () => {
    await expect(
      createQuiz({
        weekId: 'week-1',
        courseId: 'course-1',
        iptId: 'ipt-1',
        title: 'Kuiz 1',
        timerMinutes: -5,
        createdBy: 'user-1',
      })
    ).rejects.toThrow('timerMinutes mesti integer positif')
  })

  it('throws when timerMinutes is not an integer', async () => {
    await expect(
      createQuiz({
        weekId: 'week-1',
        courseId: 'course-1',
        iptId: 'ipt-1',
        title: 'Kuiz 1',
        timerMinutes: 1.5,
        createdBy: 'user-1',
      })
    ).rejects.toThrow('timerMinutes mesti integer positif')
  })

  it('creates quiz when timerMinutes is valid positive integer', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'quiz-1',
        week_id: 'week-1',
        course_id: 'course-1',
        ipt_id: 'ipt-1',
        title: 'Kuiz 1',
        timer_minutes: 30,
        randomize_questions: false,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        description: null,
      },
      error: null,
    })
    const mockInsert = vi.fn().mockReturnValue({ select: () => ({ single: mockSingle }) })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: () => ({ insert: mockInsert }),
    })

    const quiz = await createQuiz({
      weekId: 'week-1',
      courseId: 'course-1',
      iptId: 'ipt-1',
      title: 'Kuiz 1',
      timerMinutes: 30,
      createdBy: 'user-1',
    })
    expect(quiz.timer_minutes).toBe(30)
  })
})

// ---------------------------------------------------------------------------
// 3.4 — addQuestion validation: options must have ≥2 items for multiple_choice
// ---------------------------------------------------------------------------
describe('addQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when multiple_choice question has fewer than 2 options', async () => {
    await expect(
      addQuestion({
        quizId: 'quiz-1',
        iptId: 'ipt-1',
        questionText: 'Soalan?',
        questionType: 'multiple_choice',
        options: ['Satu'],
        correctAnswer: 'Satu',
        marks: 1,
        orderIndex: 0,
      })
    ).rejects.toThrow('Soalan pilihan berganda memerlukan sekurang-kurangnya 2 pilihan')
  })

  it('throws when multiple_choice question has zero options', async () => {
    await expect(
      addQuestion({
        quizId: 'quiz-1',
        iptId: 'ipt-1',
        questionText: 'Soalan?',
        questionType: 'multiple_choice',
        options: [],
        correctAnswer: 'A',
        marks: 1,
        orderIndex: 0,
      })
    ).rejects.toThrow('Soalan pilihan berganda memerlukan sekurang-kurangnya 2 pilihan')
  })

  it('inserts when multiple_choice question has 2 or more options', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'q-1',
        quiz_id: 'quiz-1',
        ipt_id: 'ipt-1',
        question_text: 'Soalan?',
        question_type: 'multiple_choice',
        options: ['A', 'B'],
        correct_answer: 'A',
        marks: 1,
        order_index: 0,
      },
      error: null,
    })
    const mockInsert = vi.fn().mockReturnValue({ select: () => ({ single: mockSingle }) })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: () => ({ insert: mockInsert }),
    })

    const q = await addQuestion({
      quizId: 'quiz-1',
      iptId: 'ipt-1',
      questionText: 'Soalan?',
      questionType: 'multiple_choice',
      options: ['A', 'B'],
      correctAnswer: 'A',
      marks: 1,
      orderIndex: 0,
    })
    expect(q.question_type).toBe('multiple_choice')
  })
})

// ---------------------------------------------------------------------------
// 3.4 — shuffleQuestions (pure function)
// ---------------------------------------------------------------------------
describe('shuffleQuestions', () => {
  it('returns an array of the same length', () => {
    const questions = [1, 2, 3, 4, 5].map((i) =>
      makeQuestion({ id: `q-${i}`, order_index: i })
    )
    const shuffled = shuffleQuestions(questions)
    expect(shuffled).toHaveLength(questions.length)
  })

  it('contains all original questions (is a permutation)', () => {
    const questions = [1, 2, 3, 4, 5].map((i) =>
      makeQuestion({ id: `q-${i}`, order_index: i })
    )
    const shuffled = shuffleQuestions(questions)
    const originalIds = questions.map((q) => q.id).sort()
    const shuffledIds = shuffled.map((q) => q.id).sort()
    expect(shuffledIds).toEqual(originalIds)
  })

  it('does not mutate the original array', () => {
    const questions = [1, 2, 3, 4, 5].map((i) =>
      makeQuestion({ id: `q-${i}`, order_index: i })
    )
    const originalCopy = [...questions]
    shuffleQuestions(questions)
    expect(questions.map((q) => q.id)).toEqual(originalCopy.map((q) => q.id))
  })
})

// ---------------------------------------------------------------------------
// 3.4 — scoreAnswer (pure grading logic)
// ---------------------------------------------------------------------------
describe('scoreAnswer', () => {
  it('awards full marks for correct multiple_choice answer', () => {
    const q = makeQuestion({
      question_type: 'multiple_choice',
      correct_answer: '4',
      marks: 2,
    })
    expect(scoreAnswer(q, '4')).toBe(2)
  })

  it('awards zero marks for wrong multiple_choice answer', () => {
    const q = makeQuestion({
      question_type: 'multiple_choice',
      correct_answer: '4',
      marks: 2,
    })
    expect(scoreAnswer(q, '6')).toBe(0)
  })

  it('is case-insensitive for multiple_choice', () => {
    const q = makeQuestion({
      question_type: 'multiple_choice',
      correct_answer: 'True',
      marks: 1,
    })
    expect(scoreAnswer(q, 'true')).toBe(1)
    expect(scoreAnswer(q, 'TRUE')).toBe(1)
  })

  it('awards zero marks for wrong true_false answer', () => {
    const q = makeQuestion({
      question_type: 'true_false',
      correct_answer: 'true',
      marks: 1,
    })
    expect(scoreAnswer(q, 'false')).toBe(0)
  })

  it('awards full marks for correct true_false answer', () => {
    const q = makeQuestion({
      question_type: 'true_false',
      correct_answer: 'true',
      marks: 1,
    })
    expect(scoreAnswer(q, 'true')).toBe(1)
  })

  it('returns -1 for short_answer questions (pending manual grading)', () => {
    const q = makeQuestion({
      question_type: 'short_answer',
      correct_answer: null,
      marks: 3,
    })
    expect(scoreAnswer(q, 'some answer')).toBe(-1)
  })

  it('returns -1 for short_answer even if correct_answer is set', () => {
    const q = makeQuestion({
      question_type: 'short_answer',
      correct_answer: 'expected answer',
      marks: 3,
    })
    expect(scoreAnswer(q, 'expected answer')).toBe(-1)
  })
})
