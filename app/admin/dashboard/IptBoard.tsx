'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ToggleIptButton } from './ToggleIptButton'

interface IptData {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
  created_at: string
  _count: { users: number; courses: number; enrollments: number }
  admins: { id: string; nama: string; role: string; ic_number: string }[]
}

export function IptBoard({ ipts }: { ipts: IptData[] }) {
  const [search, setSearch] = useState('')

  const filtered = ipts.filter(
    (ipt) =>
      ipt.name.toLowerCase().includes(search.toLowerCase()) ||
      ipt.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Header + Search */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-lg font-semibold text-gray-900 shrink-0">Senarai IPT</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari IPT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
          </div>
          <p className="text-sm text-gray-400 shrink-0">{filtered.length} / {ipts.length} IPT</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-gray-500 font-medium">
            {ipts.length === 0 ? 'Tiada IPT lagi' : `Tiada IPT sepadan dengan "${search}"`}
          </p>
          {ipts.length === 0 && (
            <p className="text-gray-400 text-sm mt-1">Klik &quot;Tambah IPT&quot; untuk bermula</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ipt) => (
            <div key={ipt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Card Header */}
              <div className={`px-5 py-4 flex items-center gap-3 ${ipt.is_active ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                {ipt.logo_url ? (
                  <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden ring-2 ring-white/30 bg-white/20">
                    <Image src={ipt.logo_url} alt={ipt.name} width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                    <span className="text-white text-lg font-bold">{ipt.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{ipt.name}</h3>
                  <p className="text-blue-200 text-xs font-mono">/{ipt.slug}</p>
                </div>
                {ipt.is_active ? (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-green-400/20 px-2 py-0.5 text-xs font-semibold text-green-100">Aktif</span>
                ) : (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-red-400/20 px-2 py-0.5 text-xs font-semibold text-red-200">Tidak Aktif</span>
                )}
              </div>

              {/* Stats */}
              <div className="px-5 py-4 grid grid-cols-3 gap-3 text-center border-b border-gray-100">
                <div>
                  <p className="text-xl font-bold text-gray-900">{ipt._count.users}</p>
                  <p className="text-xs text-gray-500">Pengguna</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{ipt._count.courses}</p>
                  <p className="text-xs text-gray-500">Kursus</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{ipt._count.enrollments}</p>
                  <p className="text-xs text-gray-500">Pendaftaran</p>
                </div>
              </div>

              {/* Admin List */}
              <div className="px-5 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pentadbir IPT</p>
                {ipt.admins.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Tiada pentadbir ditetapkan</p>
                ) : (
                  <div className="space-y-1.5">
                    {ipt.admins.map((admin) => (
                      <div key={admin.id} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${admin.role === 'super_admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {admin.nama[0]}
                        </div>
                        <p className="text-sm text-gray-800 truncate flex-1">{admin.nama}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${admin.role === 'super_admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {admin.role === 'super_admin' ? 'Super' : 'Admin'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Link href={`/${ipt.slug}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">Portal →</Link>
                  <span className="text-gray-300">|</span>
                  <Link href={`/admin/ipts/${ipt.id}/edit`} className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors">Edit</Link>
                  <span className="text-gray-300">|</span>
                  <Link href={`/admin/ipts/${ipt.id}/admins`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Pentadbir</Link>
                </div>
                <ToggleIptButton iptId={ipt.id} isActive={ipt.is_active} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
