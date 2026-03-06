import { createClient } from '@/lib/supabase/server'
import type { AttendanceSession, AttendanceRecord } from '@/lib/types'

export async function createSession(params: {
  courseId: string
  iptId: string
  sessionDate: string
  title: string
  createdBy: string
}): Promise<AttendanceSession> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert({
      course_id: params.courseId,
      ipt_id: params.iptId,
      session_date: params.sessionDate,
      title: params.title,
      created_by: params.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSessionsByCourse(courseId: string): Promise<AttendanceSession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('course_id', courseId)
    .order('session_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getSessionById(sessionId: string): Promise<AttendanceSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function markAttendance(params: {
  sessionId: string
  userId: string
  iptId: string
  status: 'present' | 'absent'
}): Promise<AttendanceRecord> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      ipt_id: params.iptId,
      status: params.status,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Rekod kehadiran sudah wujud')
    }
    throw error
  }
  return data
}

export async function getAttendanceReport(sessionId: string): Promise<AttendanceRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId)

  if (error) throw error
  return data ?? []
}

export async function getUserAttendanceHistory(
  userId: string,
  courseId: string
): Promise<(AttendanceRecord & { session: AttendanceSession })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, session:attendance_sessions(*)')
    .eq('user_id', userId)
    .eq('attendance_sessions.course_id', courseId)

  if (error) throw error
  return (data ?? []) as (AttendanceRecord & { session: AttendanceSession })[]
}
