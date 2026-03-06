import { getIptBySlug } from '@/lib/ipt'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCoursesByIpt } from '@/lib/courses'
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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ ipt_slug: string }>
}) {
  const { ipt_slug } = await params
  const ipt = await getIptBySlug(ipt_slug)
  if (!ipt) notFound()

  const user = await getUser()
  if (!user) redirect(`/${ipt_slug}/login`)

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('users')
    .select('nama, role, kelas_latihan')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const nama = profile?.nama ?? user.email ?? 'Pengguna'

  const courses = await getCoursesByIpt(ipt.id)

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {nama}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">{ipt.name}</p>
      </div>

      {/* Quick action cards (admin) */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Urus Pengguna', href: `/${ipt_slug}/admin/users`, icon: '👥' },
            { label: 'Urus Kursus', href: `/${ipt_slug}/admin/courses`, icon: '📚' },
            { label: 'Jadual Kelas', href: `/${ipt_slug}/admin/schedule`, icon: '📅' },
            { label: 'Semua Kursus', href: `/${ipt_slug}/courses`, icon: '🎓' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-5 flex flex-col gap-2 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Course overview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Gambaran Kursus</h2>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href={`/${ipt_slug}/admin/courses/new`}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Cipta Kursus
              </Link>
            )}
            <Link href={`/${ipt_slug}/courses`} className="text-sm text-blue-600 hover:underline font-medium">
              Semua kursus →
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Tiada kursus aktif.</p>
            <p className="text-gray-400 text-sm mt-1">
              {isAdmin ? 'Cipta kursus pertama di "Urus Kursus".' : 'Hubungi pentadbir untuk pendaftaran kursus.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, i) => (
              <Link
                key={course.id}
                href={`/${ipt_slug}/courses/${course.id}`}
                className="group rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
              >
                {/* Dark header */}
                <div className={`relative h-36 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex flex-col items-center justify-center`}>
                  {/* IPT badge */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-sm bg-blue-700 text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
                      {ipt.name.replace('PSSCM ', '')}
                    </span>
                  </div>
                  {/* Course initials */}
                  <div className="text-white/20 text-5xl font-black select-none">
                    {course.title.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-900 transition-colors line-clamp-1">
                    {course.title}
                  </p>
                  {course.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
