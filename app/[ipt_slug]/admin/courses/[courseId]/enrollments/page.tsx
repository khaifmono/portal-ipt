import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getEnrollmentsByCourse } from '@/lib/enrollments'
import { getUsersByIpt } from '@/lib/users'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import EnrollmentManager from './EnrollmentManager'

export default async function EnrollmentPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  if (!['admin', 'super_admin'].includes(user.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const [enrollments, allUsers] = await Promise.all([
    getEnrollmentsByCourse(courseId),
    getUsersByIpt(ipt.id),
  ])

  // Filter out users who are already enrolled
  const enrolledUserIds = new Set(enrollments.map((e) => e.user_id))
  const availableUsers = allUsers.filter((u) => !enrolledUserIds.has(u.id))

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href={`/${ipt_slug}/admin/courses`} className="hover:text-blue-600 transition-colors">
            Urus Kursus
          </Link>
          <span>/</span>
          <span className="text-gray-700">Pendaftaran</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pendaftaran Pelajar</h1>
            <p className="text-sm text-gray-500 mt-0.5">{course.title}</p>
          </div>
          <Link
            href={`/${ipt_slug}/admin/courses`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kembali
          </Link>
        </div>
      </div>

      <EnrollmentManager
        enrollments={enrollments}
        availableUsers={availableUsers}
        courseId={courseId}
        iptId={ipt.id}
        iptSlug={ipt_slug}
      />
    </div>
  )
}
