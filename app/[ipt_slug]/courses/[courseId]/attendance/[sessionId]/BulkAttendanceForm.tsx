'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AttendanceStatusType } from '@/lib/types'

interface Student {
  userId: string
  nama: string
  icNumber: string
}

interface BulkAttendanceFormProps {
  sessionId: string
  iptId: string
  iptSlug: string
  courseId: string
  students: Student[]
  existingRecords: Record<string, { status: AttendanceStatusType; remark: string | null }>
}

const STATUSES: { value: AttendanceStatusType; short: string; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    value: 'present',
    short: 'P',
    label: 'Hadir',
    activeClass: 'bg-green-500 text-white ring-2 ring-green-600 ring-offset-1',
    inactiveClass: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
  },
  {
    value: 'absent',
    short: 'A',
    label: 'Tidak Hadir',
    activeClass: 'bg-red-500 text-white ring-2 ring-red-600 ring-offset-1',
    inactiveClass: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
  },
  {
    value: 'late',
    short: 'L',
    label: 'Lewat',
    activeClass: 'bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-1',
    inactiveClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
  },
  {
    value: 'excused',
    short: 'E',
    label: 'Dimaafkan',
    activeClass: 'bg-blue-500 text-white ring-2 ring-blue-600 ring-offset-1',
    inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
  },
]

export function BulkAttendanceForm({
  sessionId,
  iptId,
  iptSlug,
  courseId,
  students,
  existingRecords,
}: BulkAttendanceFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize state from existing records
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatusType>>(() => {
    const initial: Record<string, AttendanceStatusType> = {}
    for (const student of students) {
      const existing = existingRecords[student.userId]
      if (existing) {
        initial[student.userId] = existing.status
      }
    }
    return initial
  })

  const [remarkMap, setRemarkMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const student of students) {
      const existing = existingRecords[student.userId]
      if (existing?.remark) {
        initial[student.userId] = existing.remark
      }
    }
    return initial
  })

  const setStudentStatus = useCallback((userId: string, status: AttendanceStatusType) => {
    setStatusMap((prev) => ({ ...prev, [userId]: status }))
    setSaved(false)
  }, [])

  const setStudentRemark = useCallback((userId: string, remark: string) => {
    setRemarkMap((prev) => ({ ...prev, [userId]: remark }))
    setSaved(false)
  }, [])

  function markAllPresent() {
    const newMap: Record<string, AttendanceStatusType> = {}
    for (const student of students) {
      newMap[student.userId] = 'present'
    }
    setStatusMap(newMap)
    setSaved(false)
  }

  async function handleSave() {
    // Validate that all students have a status
    const unmarked = students.filter((s) => !statusMap[s.userId])
    if (unmarked.length > 0) {
      setError(`${unmarked.length} pelajar belum ditandakan. Sila tandakan semua pelajar sebelum menyimpan.`)
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)

    const records = students.map((s) => ({
      userId: s.userId,
      status: statusMap[s.userId],
      remark: remarkMap[s.userId] || undefined,
    }))

    try {
      const res = await fetch(
        `/${iptSlug}/courses/${courseId}/attendance/${sessionId}/mark`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, iptId, records }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Ralat semasa menyimpan kehadiran.')
        return
      }

      setSaved(true)
      router.refresh()
    } catch {
      setError('Ralat rangkaian. Sila cuba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const markedCount = Object.keys(statusMap).length
  const totalCount = students.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={markAllPresent}
            disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Tandakan Semua Hadir
          </button>
          <span className="text-xs text-gray-500">
            {markedCount}/{totalCount} ditandakan
          </span>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Berjaya disimpan!
            </span>
          )}
          {error && (
            <span className="text-sm text-red-600 font-medium max-w-xs truncate" title={error}>
              {error}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
        {STATUSES.map((s) => (
          <span key={s.value} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded-full ${
              s.value === 'present' ? 'bg-green-500' :
              s.value === 'absent' ? 'bg-red-500' :
              s.value === 'late' ? 'bg-amber-500' :
              'bg-blue-500'
            }`} />
            {s.short} = {s.label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-center px-3 py-3 font-semibold text-gray-600 w-12">Bil</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nama</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">No IC</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student, index) => {
              const currentStatus = statusMap[student.userId] ?? null
              const currentRemark = remarkMap[student.userId] ?? ''

              return (
                <tr
                  key={student.userId}
                  className={`transition-colors ${
                    currentStatus ? 'bg-white' : 'bg-yellow-50'
                  } hover:bg-gray-50`}
                >
                  <td className="text-center px-3 py-3 text-gray-400 font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{student.nama}</div>
                    <div className="text-xs text-gray-400 sm:hidden">{student.icNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">
                    {student.icNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {STATUSES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setStudentStatus(student.userId, s.value)}
                          disabled={saving}
                          title={s.label}
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                            currentStatus === s.value ? s.activeClass : s.inactiveClass
                          }`}
                        >
                          {s.short}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <input
                      type="text"
                      value={currentRemark}
                      onChange={(e) => setStudentRemark(student.userId, e.target.value)}
                      placeholder="Catatan..."
                      disabled={saving}
                      className="w-full min-w-[120px] rounded-md border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          {markedCount}/{totalCount} pelajar ditandakan
        </span>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Berjaya disimpan!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
