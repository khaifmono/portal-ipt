import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { markAttendance, createSession, getAttendanceReport } from '@/lib/attendance'
import { createClient } from '@/lib/supabase/server'

describe('markAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase insert with correct params for present status', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'record-1',
        session_id: 'session-1',
        user_id: 'user-1',
        ipt_id: 'ipt-1',
        status: 'present',
        marked_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    })

    const result = await markAttendance({
      sessionId: 'session-1',
      userId: 'user-1',
      iptId: 'ipt-1',
      status: 'present',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      session_id: 'session-1',
      user_id: 'user-1',
      ipt_id: 'ipt-1',
      status: 'present',
    })
    expect(result.status).toBe('present')
  })

  it('calls supabase insert with correct params for absent status', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'record-2',
        session_id: 'session-1',
        user_id: 'user-2',
        ipt_id: 'ipt-1',
        status: 'absent',
        marked_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    })

    const result = await markAttendance({
      sessionId: 'session-1',
      userId: 'user-2',
      iptId: 'ipt-1',
      status: 'absent',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      session_id: 'session-1',
      user_id: 'user-2',
      ipt_id: 'ipt-1',
      status: 'absent',
    })
    expect(result.status).toBe('absent')
  })

  it('throws on duplicate record (error code 23505)', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    })

    await expect(
      markAttendance({
        sessionId: 'session-1',
        userId: 'user-1',
        iptId: 'ipt-1',
        status: 'present',
      })
    ).rejects.toThrow('Rekod kehadiran sudah wujud')
  })
})

describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase insert with correct params', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'session-1',
        course_id: 'course-1',
        ipt_id: 'ipt-1',
        session_date: '2024-01-15',
        title: 'Sesi 1',
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

    const result = await createSession({
      courseId: 'course-1',
      iptId: 'ipt-1',
      sessionDate: '2024-01-15',
      title: 'Sesi 1',
      createdBy: 'user-1',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      course_id: 'course-1',
      ipt_id: 'ipt-1',
      session_date: '2024-01-15',
      title: 'Sesi 1',
      created_by: 'user-1',
    })
    expect(result.id).toBe('session-1')
  })
})

describe('getAttendanceReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns attendance records for a session', async () => {
    const mockRecords = [
      { id: 'r1', session_id: 'session-1', user_id: 'u1', ipt_id: 'ipt-1', status: 'present', marked_at: '2024-01-01T00:00:00Z' },
      { id: 'r2', session_id: 'session-1', user_id: 'u2', ipt_id: 'ipt-1', status: 'absent', marked_at: '2024-01-01T00:00:00Z' },
    ]
    const mockEq = vi.fn().mockResolvedValue({ data: mockRecords, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    })

    const records = await getAttendanceReport('session-1')
    expect(records).toHaveLength(2)
    expect(records[0].status).toBe('present')
  })
})
