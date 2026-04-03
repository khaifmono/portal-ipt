import { getIptBySlug } from '@/lib/ipt'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getSchedulesByIpt } from '@/lib/schedule'
import { notFound, redirect } from 'next/navigation'
import CalendarView from './CalendarView'
import type { CalendarEvent } from './CalendarView'

export default async function CalendarPage({
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

  // Fetch all event sources in parallel
  const [schedules, assignments, attendanceSessions] = await Promise.all([
    getSchedulesByIpt(ipt.id),
    prisma.assignment.findMany({
      where: { ipt_id: ipt.id, due_date: { not: null } },
      select: { id: true, title: true, due_date: true },
    }),
    prisma.attendanceSession.findMany({
      where: { ipt_id: ipt.id },
      select: { id: true, title: true, session_date: true },
    }),
  ])

  // Build unified events array
  const events: CalendarEvent[] = []

  // Schedules (blue)
  for (const s of schedules) {
    events.push({
      id: `schedule-${s.id}`,
      title: s.title,
      date: s.start_time,
      type: 'schedule',
      color: 'blue',
    })
  }

  // Assignment deadlines (red)
  for (const a of assignments) {
    if (a.due_date) {
      events.push({
        id: `assignment-${a.id}`,
        title: a.title,
        date: (a.due_date as Date).toISOString(),
        type: 'assignment',
        color: 'red',
      })
    }
  }

  // Attendance sessions (green)
  for (const att of attendanceSessions) {
    events.push({
      id: `attendance-${att.id}`,
      title: att.title,
      date: (att.session_date as Date).toISOString(),
      type: 'attendance',
      color: 'green',
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kalendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">{ipt.name}</p>
      </div>

      <CalendarView events={events} />
    </div>
  )
}
