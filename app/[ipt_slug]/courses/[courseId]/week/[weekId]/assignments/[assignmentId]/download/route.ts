import { NextResponse } from 'next/server'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

const STAFF_ROLES = ['super_admin', 'admin', 'tenaga_pengajar'] as const

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      ipt_slug: string
      courseId: string
      weekId: string
      assignmentId: string
    }>
  }
) {
  const { ipt_slug, courseId, weekId, assignmentId } = await params

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

  // Verify week and assignment exist
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, week_id: weekId, course_id: courseId, ipt_id: ipt.id },
  })

  if (!assignment) {
    return NextResponse.json({ error: 'Tugasan tidak dijumpai' }, { status: 404 })
  }

  // Fetch all submissions with user data
  const submissions = await prisma.submission.findMany({
    where: { assignment_id: assignmentId },
    include: { user: { select: { nama: true, ic_number: true } } },
    orderBy: { submitted_at: 'asc' },
  })

  // Build CSV
  const headers = [
    'No.',
    'Nama',
    'No IC',
    'Jenis',
    'Jawapan/Fail',
    'Tarikh Hantar',
    'Markah',
    'Maklum Balas',
  ]

  const rows: string[][] = submissions.map((sub, idx) => {
    const type = sub.content_text ? 'Teks' : 'Fail'
    const content = sub.content_text ?? sub.file_path ?? '-'
    const submittedAt = new Date(sub.submitted_at).toLocaleString('ms-MY', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    const grade =
      sub.grade !== null ? `${Number(sub.grade)}/${assignment.max_score}` : 'Belum dinilai'
    const feedback = sub.feedback ?? '-'

    return [
      String(idx + 1),
      sub.user.nama,
      sub.user.ic_number,
      type,
      content,
      submittedAt,
      grade,
      feedback,
    ]
  })

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n')

  // Add BOM for Excel compatibility
  const bom = '\uFEFF'
  const csvWithBom = bom + csvContent

  const safeTitle = assignment.title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
  const filename = `submissions-${safeTitle}.csv`

  return new Response(csvWithBom, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
