import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import NewQuizForm from './NewQuizForm'

export default async function NewQuizPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; weekId: string }>
}) {
  const { ipt_slug, courseId, weekId } = await params

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

  // Role check: only admin / tenaga_pengajar
  const role = user.role
  if (!role || !['admin', 'super_admin', 'tenaga_pengajar'].includes(role)) {
    redirect(`/${ipt_slug}/courses/${courseId}/week/${weekId}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          ← Kembali ke Minggu {week.week_number}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cipta Kuiz Baharu</h1>
          <p className="text-gray-600 mt-1 text-sm">
            {course.title} — Minggu {week.week_number}: {week.title}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <NewQuizForm iptSlug={ipt_slug} courseId={courseId} weekId={weekId} />
        </div>
      </div>
    </main>
  )
}
