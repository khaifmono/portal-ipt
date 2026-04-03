import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { NewThreadForm } from './NewThreadForm'

export default async function NewThreadPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string }>
}) {
  const { ipt_slug, courseId } = await params

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/forum`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          &larr; Kembali ke Forum
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Buat Topik Baru</h1>
          <p className="text-sm text-gray-500 mb-6">
            {course.title}
          </p>

          <NewThreadForm iptSlug={ipt_slug} courseId={courseId} />
        </div>
      </div>
    </main>
  )
}
