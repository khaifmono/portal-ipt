'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Props {
  iptId: string
  currentName: string
  currentSlug: string
  currentLogoUrl: string | null
}

export function EditIptForm({ iptId, currentName, currentSlug, currentLogoUrl }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(currentName)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nama IPT diperlukan.'); return }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('name', name)
    if (logoFile) formData.append('logo', logoFile)

    const res = await fetch(`/admin/ipts/${iptId}/edit/api`, {
      method: 'PATCH',
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Ralat semasa mengemas kini.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      router.push('/admin/dashboard')
      router.refresh()
    }, 1000)
  }

  const displayLogo = logoPreview || currentLogoUrl

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo IPT</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden"
          >
            {displayLogo ? (
              logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image src={displayLogo} alt="Logo" width={80} height={80} className="w-full h-full object-cover" />
              )
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {displayLogo ? 'Tukar logo' : 'Muat naik logo'}
            </button>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG. Maks 2MB.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleLogoChange} className="hidden" />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama IPT</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      </div>

      {/* Slug (readonly) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (tidak boleh diubah)</label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400 font-mono">portalipt.khaif.dev/</span>
          <input type="text" value={currentSlug} disabled className="flex-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-mono text-gray-500 cursor-not-allowed" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">IPT berjaya dikemas kini!</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.push('/admin/dashboard')} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
