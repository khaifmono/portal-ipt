import { getIptBySlug } from '@/lib/ipt'
import { getCoursesByIpt } from '@/lib/courses'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const CARD_GRADIENTS = [
  'from-slate-700 to-slate-900',
  'from-blue-800 to-blue-950',
  'from-indigo-800 to-indigo-950',
  'from-emerald-800 to-emerald-950',
  'from-violet-800 to-violet-950',
  'from-rose-800 to-rose-950',
]

export default async function AdminCoursesPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const session = await auth()
  const user = session?.user
  if (!user) redirect(`/${ipt_slug}/login`)

  if (!['admin', 'super_admin'].includes(user.role)) {
    redirect(`/${ipt_slug}/dashboard`)
  }

  const courses = await getCoursesByIpt(ipt.id)

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Urus Kursus</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ipt.name} · {courses.length} kursus</p>
        </div>
        <Link
          href={`/${ipt_slug}/admin/courses/new`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Cipta Kursus
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Tiada kursus lagi.</p>
          <p className="text-gray-400 text-sm mt-1">Klik &quot;+ Cipta Kursus&quot; untuk bermula.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <Link
              key={course.id}
              href={`/${ipt_slug}/courses/${course.id}`}
              className="group rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200"
            >
              <div className={`relative h-40 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex flex-col items-center justify-center`}>
                <div className="absolute top-3 left-3">
                  <span className="rounded-sm bg-blue-700 text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
                    {ipt.name.replace('PSSCM ', '')}
                  </span>
                </div>
                <div className="text-white/15 text-6xl font-black select-none">
                  {course.title.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                </div>
              </div>
              <div className="bg-white px-4 py-4">
                <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                  {course.title}
                </p>
                {course.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
