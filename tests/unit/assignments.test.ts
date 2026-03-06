import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server Supabase client before importing
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { assignmentSchema } from '@/lib/assignments'
import { createClient } from '@/lib/supabase/server'

// ── assignmentSchema ──────────────────────────────────────────────────────────

describe('assignmentSchema', () => {
  it('rejects dueDate in the past', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    const result = assignmentSchema.safeParse({
      title: 'Tugasan 1',
      type: 'text',
      dueDate: pastDate,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const hasDateError = result.error.issues.some((i) => i.path.includes('dueDate'))
      expect(hasDateError).toBe(true)
    }
  })

  it('accepts dueDate in the future', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours from now
    const result = assignmentSchema.safeParse({
      title: 'Tugasan 1',
      type: 'text',
      dueDate: futureDate,
    })
    expect(result.success).toBe(true)
  })

  it('accepts assignment without dueDate', () => {
    const result = assignmentSchema.safeParse({
      title: 'Tugasan tanpa tarikh',
      type: 'file_upload',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid type', () => {
    const result = assignmentSchema.safeParse({
      title: 'Tugasan',
      type: 'invalid_type',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = assignmentSchema.safeParse({
      title: '',
      type: 'text',
    })
    expect(result.success).toBe(false)
  })
})

// ── gradeSubmission validation ────────────────────────────────────────────────

describe('gradeSubmission validation', () => {
  it('throws if grade is below 0', async () => {
    const { gradeSubmission } = await import('@/lib/grading')
    await expect(
      gradeSubmission('sub-1', -1, undefined, 'grader-1')
    ).rejects.toThrow()
  })

  it('throws if grade is above 100', async () => {
    const { gradeSubmission } = await import('@/lib/grading')
    await expect(
      gradeSubmission('sub-1', 101, undefined, 'grader-1')
    ).rejects.toThrow()
  })

  it('accepts grade of 0', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'sub-1',
        assignment_id: 'asgn-1',
        user_id: 'user-1',
        ipt_id: 'ipt-1',
        content_text: 'answer',
        file_path: null,
        submitted_at: new Date().toISOString(),
        grade: 0,
        feedback: null,
        graded_by: 'grader-1',
        graded_at: new Date().toISOString(),
      },
      error: null,
    })
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) }),
    })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: () => ({ update: mockUpdate }),
    })

    const { gradeSubmission } = await import('@/lib/grading')
    const result = await gradeSubmission('sub-1', 0, undefined, 'grader-1')
    expect(result.grade).toBe(0)
  })

  it('accepts grade of 100', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'sub-1',
        assignment_id: 'asgn-1',
        user_id: 'user-1',
        ipt_id: 'ipt-1',
        content_text: 'answer',
        file_path: null,
        submitted_at: new Date().toISOString(),
        grade: 100,
        feedback: null,
        graded_by: 'grader-1',
        graded_at: new Date().toISOString(),
      },
      error: null,
    })
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) }),
    })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: () => ({ update: mockUpdate }),
    })

    const { gradeSubmission } = await import('@/lib/grading')
    const result = await gradeSubmission('sub-1', 100, 'Sangat baik', 'grader-1')
    expect(result.grade).toBe(100)
  })
})
