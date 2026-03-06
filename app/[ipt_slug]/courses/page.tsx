import { getIptBySlug } from '@/lib/ipt'
import { getCoursesByIpt } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const courses = await getCoursesByIpt(ipt.id)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kursus</h1>
        <p className="text-sm text-gray-500 mb-8">{ipt.name}</p>

        {courses.length === 0 ? (
          <p className="text-gray-500">Tiada kursus tersedia.</p>
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
