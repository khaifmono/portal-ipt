import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { NewSessionForm } from './NewSessionForm'

export default async function NewAttendanceSessionPage({
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

  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(user.role)) {
    redirect(`/${ipt_slug}/courses/${courseId}/attendance`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/attendance`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Kembali ke Kehadiran
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tambah Sesi Kehadiran</h1>
          <p className="text-sm text-gray-500 mb-6">{course.title}</p>

          <NewSessionForm
            courseId={courseId}
            iptId={ipt.id}
            iptSlug={ipt_slug}
            createdBy={user.id}
          />
        </div>
      </div>
    </main>
  )
}
