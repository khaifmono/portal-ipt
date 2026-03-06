import { createAdminClient } from '@/lib/supabase/admin'
import type { Course, CourseWeek } from '@/lib/types'

export async function getCoursesByIpt(iptId: string): Promise<Course[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('ipt_id', iptId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function createCourse(params: {
  iptId: string
  title: string
  description?: string
  createdBy: string
}): Promise<Course> {
  if (!params.iptId) throw new Error('ipt_id diperlukan untuk mencipta kursus')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('courses')
    .insert({
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      created_by: params.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getWeeksByCourse(courseId: string): Promise<CourseWeek[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('course_weeks')
    .select('*')
    .eq('course_id', courseId)
    .order('week_number')

  if (error) throw error
  return data ?? []
}

export async function addWeekToCourse(params: {
  courseId: string
  iptId: string
  title: string
  description?: string
}): Promise<CourseWeek> {
  const supabase = createAdminClient()

  // Determine next week number
  const { data: existing, error: countError } = await supabase
    .from('course_weeks')
    .select('week_number')
    .eq('course_id', params.courseId)
    .order('week_number', { ascending: false })
    .limit(1)

  if (countError) throw countError

  const nextWeekNumber = existing && existing.length > 0 ? existing[0].week_number + 1 : 1

  const { data, error } = await supabase
    .from('course_weeks')
    .insert({
      course_id: params.courseId,
      ipt_id: params.iptId,
      week_number: nextWeekNumber,
      title: params.title,
      description: params.description ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
