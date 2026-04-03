'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IptLogo } from '@/components/ui/IptLogo'
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Senarai IPT</h2>
            <p className="text-sm text-gray-400 mt-0.5">{ipts.length} IPT berdaftar</p>
          </div>
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari IPT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">IPT</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Slug</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Pengguna</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Kursus</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Pentadbir</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                {ipts.length === 0 ? 'Tiada IPT lagi' : `Tiada IPT sepadan dengan "${search}"`}
              </td>
            </tr>
          ) : (
            filtered.map((ipt) => (
              <tr key={ipt.id} className="hover:bg-gray-50/50 transition-colors group">
                {/* Name + Logo */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {ipt.logo_url ? (
                      <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-gray-100">
                        <IptLogo src={ipt.logo_url} alt={ipt.name} size={36} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{ipt.name[0]}</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{ipt.name}</span>
                  </div>
                </td>

                {/* Slug */}
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{ipt.slug}</td>

                {/* Users */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {ipt._count.users}
                  </div>
                </td>

                {/* Courses */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    {ipt._count.courses}
                  </div>
                </td>

                {/* Admins */}
                <td className="px-6 py-4">
                  {ipt.admins.length === 0 ? (
                    <span className="text-gray-400 text-xs italic">—</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      {ipt.admins.slice(0, 3).map((admin) => (
                        <div key={admin.id} title={admin.nama} className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold -ml-1 first:ml-0 ring-2 ring-white">
                          {admin.nama[0]}
                        </div>
                      ))}
                      {ipt.admins.length > 3 && (
                        <span className="text-xs text-gray-400 ml-1">+{ipt.admins.length - 3}</span>
                      )}
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {ipt.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">Aktif</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Tidak Aktif</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/ipts/${ipt.id}/edit`} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">Edit</Link>
                    <Link href={`/admin/ipts/${ipt.id}/admins`} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">Pentadbir</Link>
                    <ToggleIptButton iptId={ipt.id} isActive={ipt.is_active} />
                    <Link href={`/${ipt.slug}`} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
