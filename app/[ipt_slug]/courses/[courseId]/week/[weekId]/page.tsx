import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { getMaterialsByWeek } from '@/lib/materials'
import { getAssignmentsByWeek } from '@/lib/assignments'
import { getQuizzesByWeek } from '@/lib/quizzes'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { MaterialType } from '@/lib/types'
import MaterialAccordion from '@/components/course/MaterialAccordion'

export default async function WeekPage({
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

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const week = await prisma.courseWeek.findFirst({
    where: { id: weekId, course_id: courseId },
  })

  if (!week) notFound()

  const role = user.role ?? 'ahli'
  const isStaff = ['admin', 'super_admin', 'tenaga_pengajar'].includes(role)

  const [materials, assignments, quizzes] = await Promise.all([
    getMaterialsByWeek(weekId),
    getAssignmentsByWeek(weekId),
    getQuizzesByWeek(weekId).catch(() => []),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${ipt_slug}/courses`} className="hover:text-blue-600 transition-colors">Kursus Saya</Link>
        <span>/</span>
        <Link href={`/${ipt_slug}/courses/${courseId}`} className="hover:text-blue-600 transition-colors">{course.title}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Minggu {week.week_number}</span>
      </nav>

      {/* Week header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-0.5 mb-2">
          Minggu {week.week_number}
        </span>
        <h1 className="text-xl font-bold text-gray-900">{week.title}</h1>
        {week.description && <p className="text-gray-500 mt-2 text-sm">{week.description}</p>}
      </div>

      {/* Materials section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Bahan Pembelajaran
          </h2>
          {isStaff && (
            <Link
              href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/materials/new`}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              + Tambah Bahan
            </Link>
          )}
        </div>

        {materials.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {isStaff ? 'Belum ada bahan. Klik "+ Tambah Bahan" untuk memuat naik bahan pertama.' : 'Tiada bahan pembelajaran untuk minggu ini.'}
          </p>
        ) : (
          <div className="space-y-2">
            {materials.map((material) => {
              const icon = materialIcon(material.type)
              const isFile = material.type === 'file'
              const href = isFile
                ? `/api/files/${material.file_path}`
                : material.url ?? '#'

              return (
                <MaterialAccordion
                  key={material.id}
                  id={material.id}
                  title={material.title}
                  description={material.description}
                  type={material.type}
                  filePath={material.file_path}
                  url={material.url}
                  icon={icon}
                  typeBadge={materialBadge(material.type)}
                  typeLabel={materialLabel(material.type)}
                  href={href}
                  isFile={isFile}
                  isStaff={isStaff}
                  deleteAction={`/${ipt_slug}/courses/${courseId}/week/${weekId}/materials/${material.id}/delete`}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Assignments section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            Tugasan
          </h2>
          {isStaff && (
            <Link
              href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/new`}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + Tugasan Baru
            </Link>
          )}
        </div>

        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Tiada tugasan untuk minggu ini.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {assignments.map((asgn) => {
              const isPastDue = asgn.due_date ? new Date() > new Date(asgn.due_date) : false
              return (
                <Link
                  key={asgn.id}
                  href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/assignments/${asgn.id}`}
                  className="flex items-center gap-4 py-3.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{asgn.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {asgn.type === 'file_upload' ? 'Muat Naik Fail' : 'Jawapan Teks'}
                      </span>
                      <span className="text-xs text-gray-400">Markah: {asgn.max_score}</span>
                    </div>
                  </div>
                  {asgn.due_date && (
                    <span className={`text-xs font-medium whitespace-nowrap ${isPastDue ? 'text-red-500' : 'text-green-600'}`}>
                      {isPastDue ? '⚠ Tamat' : '📅'} {new Date(asgn.due_date).toLocaleDateString('ms-MY')}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Quizzes section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Kuiz
          </h2>
          {isStaff && (
            <Link
              href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/new`}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              + Kuiz Baharu
            </Link>
          )}
        </div>

        {quizzes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {isStaff ? 'Belum ada kuiz. Klik "+ Kuiz Baharu" untuk mencipta kuiz pertama.' : 'Tiada kuiz untuk minggu ini.'}
          </p>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/${ipt_slug}/courses/${courseId}/week/${weekId}/quizzes/${quiz.id}`}
                className="flex items-center gap-4 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 px-4 py-3.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{quiz.title}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                    {quiz.timer_minutes && <span>{quiz.timer_minutes} minit</span>}
                    {quiz.randomize_questions && <span>Soalan diacak</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function materialIcon(type: MaterialType): string {
  switch (type) {
    case 'file': return '\u{1F4C4}'
    case 'link': return '\u{1F517}'
    case 'youtube': return '\u25B6\uFE0F'
    case 'google_drive': return '\u{1F4C1}'
    default: return '\u{1F4C4}'
  }
}

function materialBadge(type: MaterialType): string {
  switch (type) {
    case 'file': return 'bg-blue-100 text-blue-700'
    case 'link': return 'bg-gray-100 text-gray-600'
    case 'youtube': return 'bg-red-100 text-red-700'
    case 'google_drive': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function materialLabel(type: MaterialType): string {
  switch (type) {
    case 'file': return 'Fail'
    case 'link': return 'Pautan'
    case 'youtube': return 'YouTube'
    case 'google_drive': return 'Google Drive'
    default: return type
  }
}
