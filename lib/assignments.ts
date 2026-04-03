import { z } from 'zod'
import { prisma } from '@/lib/db'
import type { Assignment } from '@/lib/types'

export const assignmentSchema = z.object({
  title: z.string().min(1, 'Tajuk tugasan diperlukan'),
  description: z.string().optional(),
  type: z.enum(['file_upload', 'text'] as const),
  dueDate: z
    .date()
    .refine((d) => d > new Date(), { message: 'Tarikh akhir mesti pada masa hadapan' })
    .optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
})

export type AssignmentInput = z.infer<typeof assignmentSchema>

export async function getAssignmentsByWeek(weekId: string): Promise<Assignment[]> {
  const data = await prisma.assignment.findMany({
    where: { week_id: weekId },
    orderBy: { created_at: 'asc' },
  })
  return data.map(serialize)
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

  const data = await prisma.assignment.create({
    data: {
      week_id: params.weekId,
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      type: params.type,
      due_date: params.dueDate ?? null,
      max_score: params.maxScore ?? 100,
      created_by: params.createdBy,
    },
  })
  return serialize(data)
}

function serialize(row: Record<string, unknown>): Assignment {
  return {
    ...(row as unknown as Assignment),
    created_at: (row.created_at as Date).toISOString(),
    due_date: row.due_date ? (row.due_date as Date).toISOString() : null,
  }
}
