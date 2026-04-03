import { prisma } from '@/lib/db'
import type { Submission } from '@/lib/types'

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
  const data = await prisma.submission.findMany({
    where: { assignment_id: assignmentId },
    orderBy: { submitted_at: 'desc' },
  })
  return data.map(serialize)
}

export async function getSubmissionByUser(
  assignmentId: string,
  userId: string
): Promise<Submission | null> {
  const data = await prisma.submission.findUnique({
    where: { assignment_id_user_id: { assignment_id: assignmentId, user_id: userId } },
  })
  return data ? serialize(data) : null
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

  // Check assignment due_date
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
    select: { due_date: true },
  })

  if (!assignment) throw new Error('Tugasan tidak dijumpai')

  if (assignment.due_date && new Date() > assignment.due_date) {
    throw new Error('Tarikh akhir tugasan telah berlalu, penyerahan tidak dibenarkan')
  }

  const data = await prisma.submission.create({
    data: {
      assignment_id: params.assignmentId,
      user_id: params.userId,
      ipt_id: params.iptId,
      content_text: params.contentText ?? null,
      file_path: params.filePath ?? null,
    },
  })
  return serialize(data)
}

export async function upsertSubmission(params: {
  assignmentId: string
  userId: string
  iptId: string
  contentText?: string
  filePath?: string
}): Promise<Submission> {
  if (!params.contentText && !params.filePath) {
    throw new Error('Sekurang-kurangnya satu daripada teks jawapan atau fail mesti disediakan')
  }

  // Check assignment due_date
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
    select: { due_date: true },
  })

  if (!assignment) throw new Error('Tugasan tidak dijumpai')

  if (assignment.due_date && new Date() > assignment.due_date) {
    throw new Error('Tarikh akhir tugasan telah berlalu, penyerahan tidak dibenarkan')
  }

  // Check if existing submission has already been graded
  const existing = await prisma.submission.findUnique({
    where: {
      assignment_id_user_id: {
        assignment_id: params.assignmentId,
        user_id: params.userId,
      },
    },
  })

  if (existing && existing.grade !== null) {
    throw new Error('Penyerahan telah dinilai, tidak boleh dikemas kini')
  }

  const data = await prisma.submission.upsert({
    where: {
      assignment_id_user_id: {
        assignment_id: params.assignmentId,
        user_id: params.userId,
      },
    },
    update: {
      content_text: params.contentText ?? null,
      file_path: params.filePath ?? null,
      submitted_at: new Date(),
    },
    create: {
      assignment_id: params.assignmentId,
      user_id: params.userId,
      ipt_id: params.iptId,
      content_text: params.contentText ?? null,
      file_path: params.filePath ?? null,
    },
  })
  return serialize(data)
}

function serialize(row: Record<string, unknown>): Submission {
  return {
    ...(row as unknown as Submission),
    submitted_at: (row.submitted_at as Date).toISOString(),
    graded_at: row.graded_at ? (row.graded_at as Date).toISOString() : null,
    grade: row.grade !== null && row.grade !== undefined ? Number(row.grade) : null,
  }
}
