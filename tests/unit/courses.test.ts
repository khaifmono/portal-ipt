import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server Supabase client before importing courses
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createCourse, addWeekToCourse } from '@/lib/courses'
import { createClient } from '@/lib/supabase/server'

describe('createCourse', () => {
  it('throws if ipt_id is missing', async () => {
    await expect(
      createCourse({ iptId: '', title: 'Test', createdBy: 'user-1' })
    ).rejects.toThrow('ipt_id diperlukan')
  })

  it('calls supabase with correct ipt_id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'course-1', ipt_id: 'ipt-1', title: 'Test', created_by: 'user-1' },
      error: null,
    })
    const mockInsert = vi.fn().mockReturnValue({ select: () => ({ single: mockSingle }) })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: () => ({ insert: mockInsert }),
    })

    const course = await createCourse({ iptId: 'ipt-1', title: 'Test', createdBy: 'user-1' })
    expect(course.ipt_id).toBe('ipt-1')
  })
})

describe('addWeekToCourse', () => {
  it('sets week_number to 1 when no existing weeks', async () => {
    let insertedWeekNumber: number | undefined

    const mockSingle = vi.fn().mockImplementation(async () => ({
      data: { id: 'week-1', week_number: insertedWeekNumber },
      error: null,
    }))
    const mockInsert = vi.fn().mockImplementation((row: { week_number: number }) => {
      insertedWeekNumber = row.week_number
      return { select: () => ({ single: mockSingle }) }
    })
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockSelect = vi.fn().mockReturnValue({ eq: () => ({ order: mockOrder }) })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: (table: string) => {
        if (table === 'course_weeks') return { select: mockSelect, insert: mockInsert }
        return {}
      },
    })

    await addWeekToCourse({ courseId: 'course-1', iptId: 'ipt-1', title: 'Minggu 1' })
    expect(insertedWeekNumber).toBe(1)
  })
})
