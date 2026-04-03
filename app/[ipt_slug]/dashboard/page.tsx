import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getRecentAnnouncements } from '@/lib/announcements'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Role } from '@/lib/types'

// ─── Malay date formatting ──────────────────────────────
const MALAY_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]
const MALAY_DAYS = [
  'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu',
]

function formatMalayDate(date: Date): string {
  const day = MALAY_DAYS[date.getDay()]
  const d = date.getDate()
  const month = MALAY_MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day}, ${d} ${month} ${year}`
}

// ─── Role badge config ──────────────────────────────────
const ROLE_CONFIG: Record<Role, { label: string; bg: string; text: string }> = {
  super_admin: { label: 'Super Admin', bg: 'bg-red-100', text: 'text-red-700' },
  admin: { label: 'Pentadbir', bg: 'bg-purple-100', text: 'text-purple-700' },
  tenaga_pengajar: { label: 'Tenaga Pengajar', bg: 'bg-blue-100', text: 'text-blue-700' },
  ahli: { label: 'Ahli', bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

// ─── Card gradient backgrounds ──────────────────────────
const CARD_GRADIENTS = [
  'from-slate-700 to-slate-900',
  'from-blue-800 to-blue-950',
  'from-indigo-800 to-indigo-950',
  'from-emerald-800 to-emerald-950',
  'from-violet-800 to-violet-950',
  'from-rose-800 to-rose-950',
]

// ─── Stat icon SVGs ─────────────────────────────────────
function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function AcademicCapIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15v-3.075m0 0a48.3 48.3 0 015.25-1.635" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function MegaphoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

// ─── Stat card component ────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color = 'text-gray-900',
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Data fetchers ──────────────────────────────────────

async function getAdminStats(iptId: string) {
  const [userCount, courseCount, studentCount, presentCount, totalAttendance] =
    await Promise.all([
      prisma.user.count({ where: { ipt_id: iptId } }),
      prisma.course.count({ where: { ipt_id: iptId } }),
      prisma.user.count({ where: { ipt_id: iptId, role: 'ahli' } }),
      prisma.attendanceRecord.count({ where: { ipt_id: iptId, status: 'present' } }),
      prisma.attendanceRecord.count({ where: { ipt_id: iptId } }),
    ])

  const attendanceRate = totalAttendance > 0
    ? Math.round((presentCount / totalAttendance) * 100)
    : 0

  return { userCount, courseCount, studentCount, attendanceRate, totalAttendance }
}

async function getInstructorStats(userId: string, iptId: string) {
  const [courseCount, ungradedCount, sessionCount] = await Promise.all([
    prisma.course.count({ where: { ipt_id: iptId, created_by: userId } }),
    prisma.submission.count({
      where: {
        ipt_id: iptId,
        grade: null,
        assignment: { created_by: userId },
      },
    }),
    prisma.attendanceSession.count({ where: { ipt_id: iptId, created_by: userId } }),
  ])

  return { courseCount, ungradedCount, sessionCount }
}

async function getStudentStats(userId: string, iptId: string) {
  const [enrollmentCount, submissionCount, gradeAgg, presentCount, totalAttendance] =
    await Promise.all([
      prisma.enrollment.count({ where: { user_id: userId, ipt_id: iptId } }),
      prisma.submission.count({ where: { user_id: userId, ipt_id: iptId } }),
      prisma.submission.aggregate({
        where: { user_id: userId, ipt_id: iptId, grade: { not: null } },
        _avg: { grade: true },
      }),
      prisma.attendanceRecord.count({ where: { user_id: userId, ipt_id: iptId, status: 'present' } }),
      prisma.attendanceRecord.count({ where: { user_id: userId, ipt_id: iptId } }),
    ])

  const avgGrade = gradeAgg._avg.grade ? Number(gradeAgg._avg.grade) : null
  const attendanceRate = totalAttendance > 0
    ? Math.round((presentCount / totalAttendance) * 100)
    : 0

  return { enrollmentCount, submissionCount, avgGrade, attendanceRate, totalAttendance }
}

async function getUserCourses(userId: string, role: Role, iptId: string) {
  if (role === 'admin' || role === 'super_admin') {
    return prisma.course.findMany({
      where: { ipt_id: iptId },
      orderBy: { created_at: 'desc' },
      take: 6,
      include: {
        _count: { select: { enrollments: true, weeks: true } },
      },
    })
  }

  if (role === 'tenaga_pengajar') {
    return prisma.course.findMany({
      where: { ipt_id: iptId, created_by: userId },
      orderBy: { created_at: 'desc' },
      take: 6,
      include: {
        _count: { select: { enrollments: true, weeks: true } },
      },
    })
  }

  // ahli — enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { user_id: userId, ipt_id: iptId },
    include: {
      course: {
        include: {
          _count: { select: { enrollments: true, weeks: true } },
        },
      },
    },
    orderBy: { enrolled_at: 'desc' },
    take: 6,
  })

  return enrollments.map((e) => e.course)
}

// ─── Main page ──────────────────────────────────────────

export default async function DashboardPage({
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

  const role = user.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isInstructor = role === 'tenaga_pengajar'
  const isStudent = role === 'ahli'
  const nama = user.nama ?? 'Pengguna'
  const roleConfig = ROLE_CONFIG[role]

  // Fetch all data in parallel
  const [announcements, courses] = await Promise.all([
    getRecentAnnouncements(ipt.id, 3),
    getUserCourses(user.id, role, ipt.id),
  ])

  // Role-specific stats
  let adminStats: Awaited<ReturnType<typeof getAdminStats>> | null = null
  let instructorStats: Awaited<ReturnType<typeof getInstructorStats>> | null = null
  let studentStats: Awaited<ReturnType<typeof getStudentStats>> | null = null

  if (isAdmin) {
    adminStats = await getAdminStats(ipt.id)
  } else if (isInstructor) {
    instructorStats = await getInstructorStats(user.id, ipt.id)
  } else if (isStudent) {
    studentStats = await getStudentStats(user.id, ipt.id)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, {nama}!
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleConfig.bg} ${roleConfig.text}`}>
              {roleConfig.label}
            </span>
            <span className="text-sm text-gray-400">{ipt.name}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {formatMalayDate(new Date())}
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && adminStats && (
          <>
            <StatCard
              icon={<UsersIcon />}
              label="Jumlah Pengguna"
              value={adminStats.userCount}
              color="text-blue-700"
            />
            <StatCard
              icon={<BookIcon />}
              label="Jumlah Kursus"
              value={adminStats.courseCount}
              color="text-blue-700"
            />
            <StatCard
              icon={<AcademicCapIcon />}
              label="Pelajar Aktif"
              value={adminStats.studentCount}
              color="text-emerald-700"
            />
            <StatCard
              icon={<ChartIcon />}
              label="Kadar Kehadiran"
              value={adminStats.totalAttendance > 0 ? `${adminStats.attendanceRate}%` : '-'}
              color={adminStats.attendanceRate >= 80 ? 'text-emerald-700' : adminStats.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'}
              subtitle={adminStats.totalAttendance > 0 ? `${adminStats.totalAttendance} rekod` : 'Tiada data'}
            />
          </>
        )}

        {isInstructor && instructorStats && (
          <>
            <StatCard
              icon={<BookIcon />}
              label="Kursus Saya"
              value={instructorStats.courseCount}
              color="text-blue-700"
            />
            <StatCard
              icon={<ClipboardIcon />}
              label="Penyerahan Belum Dinilai"
              value={instructorStats.ungradedCount}
              color={instructorStats.ungradedCount > 0 ? 'text-amber-600' : 'text-emerald-700'}
              subtitle={instructorStats.ungradedCount > 0 ? 'Memerlukan perhatian' : 'Semua dinilai'}
            />
            <StatCard
              icon={<CalendarIcon />}
              label="Sesi Kehadiran"
              value={instructorStats.sessionCount}
              color="text-blue-700"
            />
          </>
        )}

        {isStudent && studentStats && (
          <>
            <StatCard
              icon={<BookIcon />}
              label="Kursus Didaftarkan"
              value={studentStats.enrollmentCount}
              color="text-blue-700"
            />
            <StatCard
              icon={<ClipboardIcon />}
              label="Tugasan Selesai"
              value={studentStats.submissionCount}
              color="text-blue-700"
            />
            <StatCard
              icon={<ChartIcon />}
              label="Purata Markah"
              value={studentStats.avgGrade !== null ? `${Math.round(studentStats.avgGrade)}%` : '-'}
              color={
                studentStats.avgGrade !== null
                  ? studentStats.avgGrade >= 80
                    ? 'text-emerald-700'
                    : studentStats.avgGrade >= 50
                      ? 'text-amber-600'
                      : 'text-red-600'
                  : 'text-gray-400'
              }
              subtitle={studentStats.avgGrade !== null ? undefined : 'Tiada markah lagi'}
            />
            <StatCard
              icon={<CalendarIcon />}
              label="Kadar Kehadiran"
              value={studentStats.totalAttendance > 0 ? `${studentStats.attendanceRate}%` : '-'}
              color={
                studentStats.totalAttendance > 0
                  ? studentStats.attendanceRate >= 80
                    ? 'text-emerald-700'
                    : studentStats.attendanceRate >= 50
                      ? 'text-amber-600'
                      : 'text-red-600'
                  : 'text-gray-400'
              }
              subtitle={studentStats.totalAttendance > 0 ? `${studentStats.totalAttendance} sesi` : 'Tiada data'}
            />
          </>
        )}
      </div>

      {/* ─── Quick Actions ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Tindakan Pantas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isAdmin && (
            <>
              <QuickActionLink
                href={`/${ipt_slug}/admin/users`}
                label="Urus Pengguna"
                description="Tambah & urus pengguna"
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                icon={<UsersIcon />}
              />
              <QuickActionLink
                href={`/${ipt_slug}/admin/courses`}
                label="Urus Kursus"
                description="Cipta & urus kursus"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                icon={<BookIcon />}
              />
              <QuickActionLink
                href={`/${ipt_slug}/admin/schedule`}
                label="Jadual"
                description="Urus jadual kelas"
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                icon={<CalendarIcon />}
              />
              <QuickActionLink
                href={`/${ipt_slug}/courses`}
                label="Semua Kursus"
                description="Lihat semua kursus"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                icon={<AcademicCapIcon />}
              />
            </>
          )}

          {isInstructor && (
            <>
              <QuickActionLink
                href={`/${ipt_slug}/courses`}
                label="Kursus Saya"
                description="Lihat kursus anda"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                icon={<BookIcon />}
              />
              <QuickActionLink
                href={`/${ipt_slug}/courses`}
                label="Buat Tugasan"
                description="Cipta tugasan baru"
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                icon={<ClipboardIcon />}
              />
            </>
          )}

          {isStudent && (
            <>
              <QuickActionLink
                href={`/${ipt_slug}/courses`}
                label="Kursus Saya"
                description="Lihat kursus anda"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                icon={<BookIcon />}
              />
              <QuickActionLink
                href={`/${ipt_slug}/courses`}
                label="Markah Saya"
                description="Semak keputusan"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                icon={<ChartIcon />}
              />
            </>
          )}
        </div>
      </div>

      {/* ─── Two-column layout: Announcements + Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Announcements */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MegaphoneIcon />
              Pengumuman Terkini
            </h2>
          </div>

          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <MegaphoneIcon />
              </div>
              <p className="text-sm text-gray-500">Tiada pengumuman terkini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => {
                const date = new Date(a.created_at)
                return (
                  <div
                    key={a.id}
                    className="rounded-lg border border-gray-100 p-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {a.is_pinned && (
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5 flex-shrink-0 relative top-[-1px]" />
                        )}
                        {a.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      {date.getDate()} {MALAY_MONTHS[date.getMonth()]} {date.getFullYear()}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Courses */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {isAdmin ? 'Gambaran Kursus' : 'Kursus Saya'}
            </h2>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href={`/${ipt_slug}/admin/courses/new`}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  + Cipta Kursus
                </Link>
              )}
              <Link
                href={`/${ipt_slug}/courses`}
                className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                Semua <ArrowRightIcon />
              </Link>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <BookIcon />
              </div>
              <p className="text-sm font-medium text-gray-600">Tiada kursus.</p>
              <p className="text-xs text-gray-400 mt-1">
                {isAdmin
                  ? 'Cipta kursus pertama di "Urus Kursus".'
                  : isInstructor
                    ? 'Anda belum mencipta sebarang kursus.'
                    : 'Hubungi pentadbir untuk pendaftaran kursus.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course, i) => {
                const counts = '_count' in course
                  ? (course._count as { enrollments: number; weeks: number })
                  : { enrollments: 0, weeks: 0 }

                return (
                  <Link
                    key={course.id}
                    href={`/${ipt_slug}/courses/${course.id}`}
                    className="group rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    {/* Gradient header */}
                    <div
                      className={`relative h-24 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center`}
                    >
                      <div className="text-white/15 text-4xl font-black select-none">
                        {course.title
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          {counts.enrollments} pelajar
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {counts.weeks} minggu
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Quick action link component ────────────────────────
function QuickActionLink({
  href,
  label,
  description,
  iconBg,
  iconColor,
  icon,
}: {
  href: string
  label: string
  description: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-100 px-4 py-4 flex flex-col gap-2.5 hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div>
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  )
}
