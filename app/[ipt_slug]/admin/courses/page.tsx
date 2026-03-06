import { getIptBySlug } from '@/lib/ipt'
import { getCoursesByIpt } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminCoursesPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const supabase = await createClient()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const courses = await getCoursesByIpt(ipt.id)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kursus</h1>
            <p className="text-sm text-gray-500">{ipt.name}</p>
          </div>
          <Link
            href={`/${ipt_slug}/admin/courses/new`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Cipta Kursus
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-500">Tiada kursus lagi.</p>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/${ipt_slug}/courses/${course.id}`}
                  className="block rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="font-medium text-gray-900">{course.title}</div>
                  {course.description && (
                    <div className="text-sm text-gray-500 mt-1">{course.description}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
