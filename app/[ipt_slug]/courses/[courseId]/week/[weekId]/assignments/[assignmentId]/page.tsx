import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { getSubmissionsByAssignment, getSubmissionByUser } from '@/lib/submissions'
import { prisma } from '@/lib/db'
import type { Submission } from '@/lib/types'
import SubmissionForm from './SubmissionForm'

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{
    ipt_slug: string
    courseId: string
    weekId: string
    assignmentId: string
  }>
}) {
  const { ipt_slug, courseId, weekId, assignmentId } = await params

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const week = await prisma.courseWeek.findFirst({
    where: { id: weekId, course_id: courseId },
  })

  if (!week) notFound()

  // Fetch assignment
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, week_id: weekId, ipt_id: ipt.id },
  })

  if (!assignment) notFound()

  const role = user.role
  const isStaff = role && ['admin', 'super_admin', 'tenaga_pengajar'].includes(role)

  const isPastDue = assignment.due_date ? new Date() > new Date(assignment.due_date) : false

  let submissions: Submission[] = []
  let mySubmission: Submission | null = null

  if (isStaff) {
    submissions = await getSubmissionsByAssignment(assignmentId)
  } else {
    mySubmission = await getSubmissionByUser(assignmentId, user.id)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke Minggu {week.week_number}
        </Link>

        {/* Assignment details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {assignment.type === 'file_upload' ? 'Muat Naik Fail' : 'Jawapan Teks'} ·
                Markah Penuh: {assignment.max_score}
              </p>
            </div>
            {isStaff && (
              <Link
                href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/new`}
                className="text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                + Tugasan Baru
              </Link>
            )}
          </div>

          {assignment.description && (
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{assignment.description}</p>
          )}

          {assignment.due_date && (
            <div
              className={`text-sm font-medium ${isPastDue ? 'text-red-600' : 'text-green-700'}`}
            >
              Tarikh Akhir:{' '}
              {new Date(assignment.due_date).toLocaleString('ms-MY', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
              {isPastDue && ' (Telah Tamat)'}
            </div>
          )}
        </div>

        {/* Staff: list of submissions */}
        {isStaff && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Penyerahan ({submissions.length})
              </h2>
              {submissions.length > 0 && (
                <a
                  href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}/download`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Muat Turun Semua (CSV)
                </a>
              )}
            </div>
            {submissions.length === 0 ? (
              <p className="text-sm text-gray-500">Tiada penyerahan lagi.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{sub.user_id}</span>
                      <span className="text-gray-400 ml-2">
                        {new Date(sub.submitted_at).toLocaleString('ms-MY')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {sub.grade !== null ? (
                        <span className="text-sm font-semibold text-green-700">
                          {sub.grade}/{assignment.max_score}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Belum dinilai</span>
                      )}
                      <Link
                        href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/${assignmentId}/grade/${sub.id}`}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        {sub.grade !== null ? 'Semak / Edit' : 'Nilai'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ahli: submission form or existing submission */}
        {!isStaff && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {mySubmission ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Penyerahan Anda</h2>

                {/* Submission status badge */}
                <div className="mb-3">
                  {mySubmission.grade !== null ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      Dinilai: {mySubmission.grade}/{assignment.max_score}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      Dihantar (belum dinilai)
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  Diserahkan:{' '}
                  {new Date(mySubmission.submitted_at).toLocaleString('ms-MY')}
                </p>
                {mySubmission.content_text && (
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap mb-3">
                    {mySubmission.content_text}
                  </div>
                )}
                {mySubmission.file_path && (
                  <p className="text-sm text-gray-700 mb-3">Fail: {mySubmission.file_path}</p>
                )}
                {mySubmission.grade !== null ? (
                  <div className="rounded-md bg-green-50 border border-green-200 p-4">
                    <p className="font-semibold text-green-800">
                      Markah: {mySubmission.grade}/{assignment.max_score}
                    </p>
                    {mySubmission.feedback && (
                      <p className="text-sm text-green-700 mt-1">{mySubmission.feedback}</p>
                    )}
                  </div>
                ) : !isPastDue ? (
                  /* Ungraded + not past due: allow resubmission */
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Kemas Kini Penyerahan
                    </h3>
                    <SubmissionForm
                      iptSlug={ipt_slug}
                      courseId={courseId}
                      weekId={weekId}
                      assignmentId={assignmentId}
                      assignmentType={assignment.type}
                      isUpdate
                      existingText={mySubmission.content_text ?? undefined}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 font-medium mt-3">
                    Belum dinilai. Tarikh akhir telah tamat — kemaskini tidak dibenarkan.
                  </p>
                )}
              </div>
            ) : isPastDue ? (
              <p className="text-sm text-red-600 font-medium">
                Tarikh akhir telah tamat. Penyerahan tidak lagi diterima.
              </p>
            ) : (
              <div>
                {/* Status for students who haven't submitted */}
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Belum Dihantar
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hantar Tugasan</h2>
                <SubmissionForm
                  iptSlug={ipt_slug}
                  courseId={courseId}
                  weekId={weekId}
                  assignmentId={assignmentId}
                  assignmentType={assignment.type}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
