import { prisma } from '@/lib/db'
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

  const data = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade,
      feedback: feedback ?? null,
      graded_by: gradedBy,
      graded_at: new Date(),
    },
  })

  return {
    ...(data as unknown as Submission),
    submitted_at: data.submitted_at.toISOString(),
    graded_at: data.graded_at ? data.graded_at.toISOString() : null,
    grade: data.grade !== null ? Number(data.grade) : null,
  }
}
