import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

const STAFF_ROLES = ['super_admin', 'admin', 'tenaga_pengajar'] as const

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ipt_slug: string; courseId: string }> }
) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) {
    return NextResponse.json({ error: 'IPT tidak dijumpai' }, { status: 404 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak dibenarkan' }, { status: 401 })
  }

  if (!STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) {
    return NextResponse.json({ error: 'Kursus tidak dijumpai' }, { status: 404 })
  }

  // Fetch all data in parallel
  const [enrollments, assignments, quizzes, submissions, quizAttempts, quizQuestions] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { course_id: courseId },
        include: { user: true },
        orderBy: { user: { nama: 'asc' } },
      }),
      prisma.assignment.findMany({
        where: { course_id: courseId },
        orderBy: { created_at: 'asc' },
      }),
      prisma.quiz.findMany({
        where: { course_id: courseId },
        orderBy: { created_at: 'asc' },
      }),
      prisma.submission.findMany({
        where: { assignment: { course_id: courseId } },
      }),
      prisma.quizAttempt.findMany({
        where: { quiz: { course_id: courseId }, status: 'submitted' },
      }),
      prisma.quizQuestion.findMany({
        where: { quiz: { course_id: courseId } },
      }),
    ])

  // Build lookup maps
  const submissionMap = new Map<string, Map<string, number | null>>()
  for (const sub of submissions) {
    if (!submissionMap.has(sub.assignment_id)) {
      submissionMap.set(sub.assignment_id, new Map())
    }
    submissionMap
      .get(sub.assignment_id)!
      .set(sub.user_id, sub.grade !== null ? Number(sub.grade) : null)
  }

  const quizMaxScores = new Map<string, number>()
  for (const q of quizQuestions) {
    quizMaxScores.set(q.quiz_id, (quizMaxScores.get(q.quiz_id) ?? 0) + q.marks)
  }

  const attemptMap = new Map<string, Map<string, number | null>>()
  for (const att of quizAttempts) {
    if (!attemptMap.has(att.quiz_id)) {
      attemptMap.set(att.quiz_id, new Map())
    }
    attemptMap
      .get(att.quiz_id)!
      .set(att.user_id, att.score !== null ? Number(att.score) : null)
  }

  // Build CSV
  const headers = [
    'No.',
    'Nama Pelajar',
    ...assignments.map((a) => `Tugasan: ${a.title}`),
    ...quizzes.map((q) => `Kuiz: ${q.title}`),
    'Purata (%)',
  ]

  const rows: string[][] = []

  enrollments.forEach((enrollment, idx) => {
    const row: string[] = [String(idx + 1), enrollment.user.nama]

    const percentages: number[] = []

    // Assignment grades
    for (const a of assignments) {
      const grade = submissionMap.get(a.id)?.get(enrollment.user_id) ?? undefined
      if (grade !== undefined && grade !== null) {
        row.push(`${Number(grade)}/${a.max_score}`)
        if (a.max_score > 0) {
          percentages.push((Number(grade) / a.max_score) * 100)
        }
      } else {
        row.push('-')
      }
    }

    // Quiz grades
    for (const q of quizzes) {
      const score = attemptMap.get(q.id)?.get(enrollment.user_id) ?? undefined
      const maxScore = quizMaxScores.get(q.id) ?? 0
      if (score !== undefined && score !== null) {
        row.push(`${Number(score)}/${maxScore}`)
        if (maxScore > 0) {
          percentages.push((Number(score) / maxScore) * 100)
        }
      } else {
        row.push('-')
      }
    }

    // Average
    if (percentages.length > 0) {
      const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length
      row.push(avg.toFixed(1))
    } else {
      row.push('-')
    }

    rows.push(row)
  })

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n')

  // Add BOM for Excel compatibility
  const bom = '\uFEFF'
  const csvWithBom = bom + csvContent

  const today = new Date().toISOString().split('T')[0]
  const safeTitle = course.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')
  const filename = `gradebook-${safeTitle}-${today}.csv`

  return new Response(csvWithBom, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
