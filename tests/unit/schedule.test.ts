import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createSchedule } from '@/lib/schedule'
import { createClient } from '@/lib/supabase/server'

describe('createSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when startTime is after endTime', async () => {
    await expect(
      createSchedule({
        courseId: 'course-1',
        iptId: 'ipt-1',
        title: 'Kelas Silat',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T09:00:00Z',
        createdBy: 'user-1',
      })
    ).rejects.toThrow('Masa mula mesti sebelum masa tamat')
  })

  it('throws when startTime equals endTime', async () => {
    await expect(
      createSchedule({
        courseId: 'course-1',
        iptId: 'ipt-1',
        title: 'Kelas Silat',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:00:00Z',
        createdBy: 'user-1',
      })
    ).rejects.toThrow('Masa mula mesti sebelum masa tamat')
  })

  it('throws when iptId is missing', async () => {
    await expect(
      createSchedule({
        courseId: 'course-1',
        iptId: '',
        title: 'Kelas Silat',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T10:00:00Z',
        createdBy: 'user-1',
      })
    ).rejects.toThrow()
  })

  it('calls supabase insert with correct data for valid input', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'sched-1',
        course_id: 'course-1',
        ipt_id: 'ipt-1',
        title: 'Kelas Silat',
        start_time: '2024-01-15T09:00:00Z',
        end_time: '2024-01-15T10:00:00Z',
        location: 'Dewan Utama',
        recurring: false,
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    })

    const result = await createSchedule({
      courseId: 'course-1',
      iptId: 'ipt-1',
      title: 'Kelas Silat',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:00:00Z',
      location: 'Dewan Utama',
      recurring: false,
      createdBy: 'user-1',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      course_id: 'course-1',
      ipt_id: 'ipt-1',
      title: 'Kelas Silat',
      start_time: '2024-01-15T09:00:00Z',
      end_time: '2024-01-15T10:00:00Z',
      location: 'Dewan Utama',
      recurring: false,
      created_by: 'user-1',
    })
    expect(result.id).toBe('sched-1')
  })

  it('calls supabase insert with null location when not provided', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'sched-2',
        course_id: 'course-1',
        ipt_id: 'ipt-1',
        title: 'Kelas Silat',
        start_time: '2024-01-15T09:00:00Z',
        end_time: '2024-01-15T10:00:00Z',
        location: null,
        recurring: false,
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    })

    await createSchedule({
      courseId: 'course-1',
      iptId: 'ipt-1',
      title: 'Kelas Silat',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:00:00Z',
      createdBy: 'user-1',
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ location: null, recurring: false })
    )
  })
})
