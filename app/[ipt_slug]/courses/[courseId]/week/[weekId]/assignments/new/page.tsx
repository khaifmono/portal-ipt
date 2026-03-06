import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import NewAssignmentForm from './NewAssignmentForm'

export default async function NewAssignmentPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; weekId: string }>
}) {
  const { ipt_slug, courseId, weekId } = await params

  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'super_admin', 'tenaga_pengajar'].includes(role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const supabase = await createClient()
  const { data: week, error } = await supabase
    .from('course_weeks')
    .select('*')
    .eq('id', weekId)
    .eq('course_id', courseId)
    .single()

  if (error || !week) notFound()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}/week/${weekId}`}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          ← Kembali ke Minggu {week.week_number}
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tugasan Baru</h1>
          <p className="text-sm text-gray-500 mb-6">
            {course.title} — Minggu {week.week_number}: {week.title}
          </p>

          <NewAssignmentForm iptSlug={ipt_slug} courseId={courseId} weekId={weekId} />
        </div>
      </div>
    </main>
  )
}
