import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Assignment } from '@/lib/types'

export const assignmentSchema = z.object({
  title: z.string().min(1, 'Tajuk tugasan diperlukan'),
  description: z.string().optional(),
  type: z.enum(['file_upload', 'text'], {
    errorMap: () => ({ message: "Jenis mesti 'file_upload' atau 'text'" }),
  }),
  dueDate: z
    .date()
    .refine((d) => d > new Date(), { message: 'Tarikh akhir mesti pada masa hadapan' })
    .optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
})

export type AssignmentInput = z.infer<typeof assignmentSchema>

export async function getAssignmentsByWeek(weekId: string): Promise<Assignment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('week_id', weekId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAssignment(params: {
  weekId: string
  courseId: string
  iptId: string
  title: string
  description?: string
  type: 'file_upload' | 'text'
  dueDate?: Date
  maxScore?: number
  createdBy: string
}): Promise<Assignment> {
  if (!params.iptId) throw new Error('ipt_id diperlukan untuk mencipta tugasan')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      week_id: params.weekId,
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      type: params.type,
      due_date: params.dueDate ? params.dueDate.toISOString() : null,
      max_score: params.maxScore ?? 100,
      created_by: params.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
