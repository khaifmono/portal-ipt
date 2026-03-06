import { createAdminClient } from '@/lib/supabase/admin'
import type { Schedule } from '@/lib/types'

export async function createSchedule(params: {
  courseId: string
  iptId: string
  title: string
  startTime: string
  endTime: string
  location?: string
  recurring?: boolean
  createdBy: string
}): Promise<Schedule> {
  if (!params.iptId) throw new Error('ipt_id diperlukan')

  const start = new Date(params.startTime)
  const end = new Date(params.endTime)
  if (start >= end) {
    throw new Error('Masa mula mesti sebelum masa tamat')
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('schedules')
    .insert({
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      start_time: params.startTime,
      end_time: params.endTime,
      location: params.location ?? null,
      recurring: params.recurring ?? false,
      created_by: params.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSchedulesByCourse(courseId: string): Promise<Schedule[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('course_id', courseId)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getSchedulesByIpt(iptId: string): Promise<Schedule[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('ipt_id', iptId)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data ?? []
}
