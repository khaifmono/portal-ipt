import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import GradeForm from './GradeForm'

export default async function GradeSubmissionPage({
  params,
}: {
  params: Promise<{
    ipt_slug: string
    courseId: string
    weekId: string
    assignmentId: string
    submissionId: string
  }>
}) {
  const { ipt_slug, courseId, weekId, assignmentId, submissionId } = await params

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  const role = user.role
  if (!role || !['admin', 'super_admin', 'tenaga_pengajar'].includes(role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const week = await prisma.courseWeek.findFirst({
    where: { id: weekId, course_id: courseId },
  })

  if (!week) notFound()

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, ipt_id: ipt.id },
  })

  if (!assignment) notFound()

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, assignment_id: assignmentId },
  })

  if (!submission) notFound()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          ← Kembali ke Senarai Penyerahan
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Nilai Penyerahan</h1>
          <p className="text-sm text-gray-500 mb-4">
            Tugasan: {assignment.title} · Markah Penuh: {assignment.max_score}
          </p>

          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Pelajar (ID)
            </span>
            <p className="text-sm text-gray-800 mt-0.5">{submission.user_id}</p>
          </div>

          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Tarikh Serah
            </span>
            <p className="text-sm text-gray-800 mt-0.5">
              {new Date(submission.submitted_at).toLocaleString('ms-MY')}
            </p>
          </div>

          {submission.content_text && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Jawapan Teks
              </span>
              <div className="mt-1 rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                {submission.content_text}
              </div>
            </div>
          )}

          {submission.file_path && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Fail
              </span>
              <p className="text-sm text-gray-800 mt-0.5 break-all">{submission.file_path}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Beri Markah</h2>
          <GradeForm
            iptSlug={ipt_slug}
            courseId={courseId}
            weekId={weekId}
            assignmentId={assignmentId}
            submissionId={submissionId}
            maxScore={assignment.max_score}
            currentGrade={submission.grade !== null ? Number(submission.grade) : null}
            currentFeedback={submission.feedback}
          />
        </div>
      </div>
    </main>
  )
}
