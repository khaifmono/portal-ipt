'use client'

import { useState, useMemo } from 'react'

// ─── Types ──────────────────────────────────────────────
export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date string
  type: 'schedule' | 'assignment' | 'attendance'
  color: string // Tailwind color class prefix e.g. 'blue', 'red', 'green'
}

// ─── Malay labels ───────────────────────────────────────
const DAY_HEADERS = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']

const MALAY_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

const TYPE_LABELS: Record<CalendarEvent['type'], string> = {
  schedule: 'Jadual kelas',
  assignment: 'Tarikh akhir tugasan',
  attendance: 'Sesi kehadiran',
}

// ─── Color map ──────────────────────────────────────────
const DOT_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-emerald-500',
}

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
}

// ─── Helpers ────────────────────────────────────────────
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

// ─── Component ──────────────────────────────────────────
export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Build event map keyed by date string
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const d = new Date(event.date)
      const key = toDateKey(d)
      const existing = map.get(key) ?? []
      existing.push(event)
      map.set(key, existing)
    }
    return map
  }, [events])

  // Calendar grid data
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1,
  )

  // Build grid cells
  const cells: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = []

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = currentMonth === 0 ? 11 : currentMonth - 1
    const y = currentMonth === 0 ? currentYear - 1 : currentYear
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true })
  }

  // Trailing days from next month
  const remainingCells = 7 - (cells.length % 7)
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1
      const y = currentMonth === 11 ? currentYear + 1 : currentYear
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false })
    }
  }

  // Navigation
  function goToPreviousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  function goToToday() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(toDateKey(today))
  }

  // Selected day events
  const selectedEvents = selectedDate ? (eventMap.get(selectedDate) ?? []) : []

  // Upcoming events (next 10 from today)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10)
  }, [events])

  return (
    <div className="space-y-6">
      {/* ─── Calendar Card ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header with navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              {MALAY_MONTHS[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToToday}
              className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Hari Ini
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Bulan sebelumnya"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Bulan seterusnya"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Jadual kelas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Tarikh akhir tugasan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Sesi kehadiran
          </span>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAY_HEADERS.map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const cellDate = new Date(cell.year, cell.month, cell.day)
            const dateKey = toDateKey(cellDate)
            const dayEvents = eventMap.get(dateKey) ?? []
            const isToday = isSameDay(cellDate, today)
            const isSelected = selectedDate === dateKey

            // Collect unique event type colors for dots
            const dotColors = [...new Set(dayEvents.map((e) => e.color))]

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`
                  relative min-h-[72px] sm:min-h-[84px] p-1.5 border-b border-r border-gray-100 text-left transition-colors
                  ${!cell.isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-blue-50/50'}
                  ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : ''}
                `}
              >
                <span
                  className={`
                    inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                    ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
                    ${!cell.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  `}
                >
                  {cell.day}
                </span>

                {/* Event dots */}
                {dotColors.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5 px-0.5">
                    {dotColors.map((color) => (
                      <span
                        key={color}
                        className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[color] ?? 'bg-gray-400'}`}
                      />
                    ))}
                  </div>
                )}

                {/* Event count badge on small screens, titles on larger */}
                {dayEvents.length > 0 && (
                  <div className="hidden sm:block mt-0.5 space-y-0.5 px-0.5">
                    {dayEvents.slice(0, 2).map((event) => {
                      const badge = BADGE_COLORS[event.color] ?? BADGE_COLORS.blue
                      return (
                        <div
                          key={event.id}
                          className={`rounded px-1 py-0.5 text-[10px] leading-tight font-medium truncate ${badge.bg} ${badge.text}`}
                        >
                          {event.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-gray-400 px-1">
                        +{dayEvents.length - 2} lagi
                      </p>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Selected Day Detail Panel ──────────────────── */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Acara pada {formatDateMalay(selectedDate)}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Tiada acara pada tarikh ini.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const badge = BADGE_COLORS[event.color] ?? BADGE_COLORS.blue
                return (
                  <div
                    key={event.id}
                    className={`rounded-lg border ${badge.border} ${badge.bg} px-4 py-3 flex items-start gap-3`}
                  >
                    <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLORS[event.color] ?? 'bg-gray-400'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${badge.text}`}>{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[event.type]}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Upcoming Events ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Acara Akan Datang
        </h3>
        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Tiada acara akan datang.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const badge = BADGE_COLORS[event.color] ?? BADGE_COLORS.blue
              const eventDate = new Date(event.date)
              return (
                <div
                  key={event.id}
                  className="rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-gray-500 leading-none uppercase">
                        {MALAY_MONTHS[eventDate.getMonth()].slice(0, 3)}
                      </span>
                      <span className="text-sm font-black text-gray-800 leading-none">
                        {eventDate.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[event.type]}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                    {TYPE_LABELS[event.type].split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Date formatter ─────────────────────────────────────
function formatDateMalay(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return `${d} ${MALAY_MONTHS[m - 1]} ${y}`
}
