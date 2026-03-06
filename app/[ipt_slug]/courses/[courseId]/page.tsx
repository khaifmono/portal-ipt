import { getIptBySlug } from '@/lib/ipt'
import { getCourseById, getWeeksByCourse } from '@/lib/courses'
import { getUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CoursePage({
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

  const weeks = await getWeeksByCourse(courseId)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href={`/${ipt_slug}/courses`} className="text-sm text-blue-600 hover:underline mb-4 block">
          ← Kembali ke Kursus
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        {course.description && <p className="text-gray-600 mb-8">{course.description}</p>}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Minggu Pembelajaran</h2>

        {weeks.length === 0 ? (
          <p className="text-gray-500">Tiada minggu pembelajaran lagi.</p>
        ) : (
          <ul className="space-y-2">
            {weeks.map((week) => (
              <li key={week.id}>
                <Link
                  href={`/${ipt_slug}/courses/${courseId}/week/${week.id}`}
                  className="block rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-blue-600 font-medium">Minggu {week.week_number}</span>
                  <div className="font-medium text-gray-900 mt-0.5">{week.title}</div>
                  {week.description && (
                    <div className="text-sm text-gray-500 mt-1">{week.description}</div>
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
