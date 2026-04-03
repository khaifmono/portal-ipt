'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/lib/types'
import type { EnrollmentWithUser } from '@/lib/enrollments'

interface Props {
  enrollments: EnrollmentWithUser[]
  availableUsers: User[]
  courseId: string
  iptId: string
  iptSlug: string
}

export default function EnrollmentManager({
  enrollments,
  availableUsers,
  courseId,
  iptId,
  iptSlug,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEnroll() {
    if (!selectedUserId) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/${iptSlug}/admin/courses/${courseId}/enrollments/api`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUserId, iptId }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ralat semasa mendaftarkan pelajar.')
        return
      }
      setSelectedUserId('')
      startTransition(() => router.refresh())
    } catch {
      setError('Ralat rangkaian. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUnenroll(userId: string, nama: string) {
    if (!confirm(`Adakah anda pasti mahu membatalkan pendaftaran ${nama}?`)) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/${iptSlug}/admin/courses/${courseId}/enrollments/api`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ralat semasa membatalkan pendaftaran.')
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setError('Ralat rangkaian. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const isWorking = loading || isPending

  return (
    <div className="space-y-6">
      {/* Enroll Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Pelajar</h2>

        {availableUsers.length === 0 ? (
          <p className="text-sm text-gray-500">Semua pengguna sudah didaftarkan dalam kursus ini.</p>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Pelajar
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={isWorking}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">-- Pilih pengguna --</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.ic_number}){u.kelas_latihan ? ` - ${u.kelas_latihan}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleEnroll}
              disabled={!selectedUserId || isWorking}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWorking ? 'Memproses...' : 'Daftar'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Enrollment Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Senarai Pelajar Berdaftar
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({enrollments.length} orang)
            </span>
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Tiada pelajar berdaftar lagi.</p>
            <p className="text-gray-400 text-sm mt-1">Gunakan borang di atas untuk mendaftarkan pelajar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">No IC</th>
                  <th className="px-5 py-3 font-medium">Kelas Latihan</th>
                  <th className="px-5 py-3 font-medium">Tarikh Pendaftaran</th>
                  <th className="px-5 py-3 font-medium text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enrollments.map((enrollment, i) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{enrollment.user.nama}</td>
                    <td className="px-5 py-3 text-gray-600 font-mono text-xs">{enrollment.user.ic_number}</td>
                    <td className="px-5 py-3 text-gray-600">{enrollment.user.kelas_latihan || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(enrollment.enrolled_at).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleUnenroll(enrollment.user.id, enrollment.user.nama)}
                        disabled={isWorking}
                        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Batal Daftar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
