import { createClient } from '@/lib/supabase/server'
import type { Submission } from '@/lib/types'

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getSubmissionByUser(
  assignmentId: string,
  userId: string
): Promise<Submission | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function createSubmission(params: {
  assignmentId: string
  userId: string
  iptId: string
  contentText?: string
  filePath?: string
}): Promise<Submission> {
  if (!params.contentText && !params.filePath) {
    throw new Error('Sekurang-kurangnya satu daripada teks jawapan atau fail mesti disediakan')
  }

  const supabase = await createClient()

  // Check assignment due_date
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('due_date')
    .eq('id', params.assignmentId)
    .single()

  if (assignmentError) throw assignmentError

  if (assignment?.due_date && new Date() > new Date(assignment.due_date)) {
    throw new Error('Tarikh akhir tugasan telah berlalu, penyerahan tidak dibenarkan')
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      assignment_id: params.assignmentId,
      user_id: params.userId,
      ipt_id: params.iptId,
      content_text: params.contentText ?? null,
      file_path: params.filePath ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
