import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WeekPage({
  params,
}: {
  params: Promise<{ ipt_slug: string; courseId: string; weekId: string }>
}) {
  const { ipt_slug, courseId, weekId } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

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
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${ipt_slug}/courses/${courseId}`}
          className="text-sm text-blue-600 hover:underline mb-4 block"
        >
          ← Kembali ke {course.title}
        </Link>

        <div className="mb-6">
          <span className="text-sm text-blue-600 font-medium">Minggu {week.week_number}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{week.title}</h1>
          {week.description && <p className="text-gray-600 mt-2">{week.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="font-medium text-gray-900 mb-1">Bahan Pembelajaran</div>
            <p className="text-sm text-gray-500">PDF, video, pautan Google Drive / YouTube</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="font-medium text-gray-900 mb-1">Tugasan</div>
            <p className="text-sm text-gray-500">Hantar fail atau jawapan teks</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="font-medium text-gray-900 mb-1">Kuiz</div>
            <p className="text-sm text-gray-500">Pelbagai jenis soalan dengan pemasaan</p>
          </div>
        </div>
      </div>
    </main>
  )
}
