'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Admin {
  id: string
  nama: string
  ic_number: string
  role: string
  kelas_latihan: string | null
  created_at: string
}

interface AdminManagerProps {
  iptId: string
  iptSlug: string
  admins: Admin[]
}

export function AdminManager({ iptId, iptSlug, admins }: AdminManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create admin form state
  const [nama, setNama] = useState('')
  const [icNumber, setIcNumber] = useState('')
  const [password, setPassword] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch(`/admin/ipts/${iptId}/admins/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, ic_number: icNumber, password, ipt_slug: iptSlug }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Ralat semasa mencipta pentadbir.')
      setLoading(false)
      return
    }

    setSuccess('Pentadbir berjaya dicipta!')
    setNama('')
    setIcNumber('')
    setPassword('')
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  async function handleResetPassword(userId: string, userName: string) {
    if (!confirm(`Set semula kata laluan ${userName} kepada nombor IC mereka?`)) return

    const res = await fetch(`/admin/ipts/${iptId}/admins/api`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'reset_password' }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'Ralat.')
      return
    }

    setSuccess(`Kata laluan ${userName} telah diset semula kepada nombor IC.`)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleRemove(userId: string, userName: string) {
    if (!confirm(`Buang ${userName} sebagai pentadbir? Pengguna ini akan ditukar kepada peranan 'ahli'.`)) return

    const res = await fetch(`/admin/ipts/${iptId}/admins/api`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'demote' }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'Ralat.')
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{admins.length} pentadbir berdaftar</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Pentadbir
        </button>
      </div>

      {/* Create Admin Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Pentadbir Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  placeholder="cth: Ahmad bin Ali"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombor IC (12 digit)</label>
                <input
                  type="text"
                  value={icNumber}
                  onChange={(e) => setIcNumber(e.target.value)}
                  required
                  inputMode="numeric"
                  pattern="\d{12}"
                  placeholder="cth: 900101145678"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 aksara"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Mencipta...' : 'Cipta Pentadbir'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">No IC</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarikh Cipta</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                  Tiada pentadbir untuk IPT ini. Klik &quot;Tambah Pentadbir&quot; untuk bermula.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{admin.nama[0]}</span>
                      </div>
                      <span className="font-medium text-gray-900">{admin.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{admin.ic_number}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {new Date(admin.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResetPassword(admin.id, admin.nama)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      >
                        Set Semula Kata Laluan
                      </button>
                      <button
                        onClick={() => handleRemove(admin.id, admin.nama)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Buang
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
