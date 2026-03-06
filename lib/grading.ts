import { createClient } from '@/lib/supabase/server'
import type { Submission } from '@/lib/types'

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string | undefined,
  gradedBy: string
): Promise<Submission> {
  if (grade < 0 || grade > 100) {
    throw new Error('Markah mesti antara 0 dan 100')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('submissions')
    .update({
      grade,
      feedback: feedback ?? null,
      graded_by: gradedBy,
      graded_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) throw error
  return data
}
