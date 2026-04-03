import { prisma } from '@/lib/db'
import type { Enrollment, User } from '@/lib/types'

export interface EnrollmentWithUser extends Enrollment {
  user: User
}

export async function getEnrollmentsByCourse(courseId: string): Promise<EnrollmentWithUser[]> {
  const data = await prisma.enrollment.findMany({
    where: { course_id: courseId },
    include: { user: true },
    orderBy: { enrolled_at: 'desc' },
  })
  return data.map((row) => {
    const { user, ...enrollment } = row
    const { password_hash: _, ...userWithoutPassword } = user as Record<string, unknown> & {
      password_hash: string
    }
    return {
      ...serializeEnrollment(enrollment as Record<string, unknown>),
      user: {
        ...(userWithoutPassword as unknown as User),
        created_at: (user.created_at as Date).toISOString(),
      },
    }
  })
}

export async function enrollUser(
  courseId: string,
  userId: string,
  iptId: string
): Promise<Enrollment> {
  try {
    const data = await prisma.enrollment.create({
      data: {
        course_id: courseId,
        user_id: userId,
        ipt_id: iptId,
      },
    })
    return serializeEnrollment(data as unknown as Record<string, unknown>)
  } catch (err) {
    // Handle unique constraint violation (duplicate enrollment)
    if (
      err instanceof Error &&
      'code' in err &&
      (err as Record<string, unknown>).code === 'P2002'
    ) {
      throw new Error('Pelajar sudah didaftarkan dalam kursus ini.')
    }
    throw err
  }
}

export async function unenrollUser(courseId: string, userId: string): Promise<void> {
  await prisma.enrollment.deleteMany({
    where: {
      course_id: courseId,
      user_id: userId,
    },
  })
}

export async function bulkEnroll(
  courseId: string,
  iptId: string,
  userIds: string[]
): Promise<{ enrolled: number; skipped: number }> {
  let enrolled = 0
  let skipped = 0

  for (const userId of userIds) {
    try {
      await prisma.enrollment.create({
        data: {
          course_id: courseId,
          user_id: userId,
          ipt_id: iptId,
        },
      })
      enrolled++
    } catch (err) {
      // Skip duplicates
      if (
        err instanceof Error &&
        'code' in err &&
        (err as Record<string, unknown>).code === 'P2002'
      ) {
        skipped++
        continue
      }
      throw err
    }
  }

  return { enrolled, skipped }
}

function serializeEnrollment(row: Record<string, unknown>): Enrollment {
  return {
    ...(row as unknown as Enrollment),
    enrolled_at: (row.enrolled_at as Date).toISOString(),
  }
}
