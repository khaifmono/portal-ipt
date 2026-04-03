import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import NewMaterialForm from './NewMaterialForm'

export default async function NewMaterialPage({
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

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          &larr; Kembali ke Minggu {week.week_number}
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tambah Bahan Pembelajaran</h1>
          <p className="text-sm text-gray-500 mb-6">
            {course.title} &mdash; Minggu {week.week_number}: {week.title}
          </p>

          <NewMaterialForm iptSlug={ipt_slug} courseId={courseId} weekId={weekId} />
        </div>
      </div>
    </main>
  )
}
