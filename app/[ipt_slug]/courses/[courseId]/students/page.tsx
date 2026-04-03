import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getIptBySlug } from '@/lib/ipt'
import { getCourseById } from '@/lib/courses'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CourseStudentsPage({
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
  if (!['admin', 'super_admin', 'tenaga_pengajar'].includes(user.role)) redirect(`/${ipt_slug}/dashboard`)

  const course = await getCourseById(courseId)
  if (!course || course.ipt_id !== ipt.id) notFound()

  const enrollments = await prisma.enrollment.findMany({
    where: { course_id: courseId },
    include: {
      user: {
        select: { id: true, nama: true, ic_number: true, role: true, kelas_latihan: true },
      },
    },
    orderBy: { user: { nama: 'asc' } },
  })

  const students = enrollments.filter((e) => e.user.role === 'ahli')
  const staff = enrollments.filter((e) => e.user.role !== 'ahli')

  const roleLabel: Record<string, string> = {
    admin: 'Pentadbir',
    super_admin: 'Super Admin',
    tenaga_pengajar: 'Tenaga Pengajar',
    ahli: 'Pelajar',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${ipt_slug}/courses`} className="hover:text-blue-600 transition-colors">Kursus Saya</Link>
        <span>/</span>
        <Link href={`/${ipt_slug}/courses/${courseId}`} className="hover:text-blue-600 transition-colors">{course.title}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Senarai Pelajar</span>
      </nav>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-5">
          <h1 className="text-xl font-bold text-white">Senarai Pelajar — {course.title}</h1>
          <p className="text-blue-200 text-sm mt-1">{students.length} pelajar · {staff.length} tenaga pengajar</p>
        </div>
      </div>

      {/* Staff */}
      {staff.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-600">Tenaga Pengajar & Pentadbir</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {staff.map((e) => (
              <div key={e.user.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{e.user.nama[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{e.user.nama}</p>
                  <p className="text-xs text-gray-400 font-mono">{e.user.ic_number}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{roleLabel[e.user.role]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-600">Pelajar ({students.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">Bil</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">No IC</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Kelas Latihan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Tiada pelajar berdaftar dalam kursus ini.</td>
              </tr>
            ) : (
              students.map((e, i) => (
                <tr key={e.user.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold">{e.user.nama[0]}</span>
                      </div>
                      <span className="font-medium text-gray-900">{e.user.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{e.user.ic_number}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{e.user.kelas_latihan ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
