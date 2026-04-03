'use client'

import { useState, useCallback, useRef } from 'react'
import { parseCsvUsers, type CsvUserRow, type CsvParseResult } from '@/lib/csv-parser'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  tenaga_pengajar: 'Tenaga Pengajar',
  ahli: 'Ahli',
}

interface ImportResult {
  success: number
  failed: number
  errors: { ic_number: string; error: string }[]
}

export function CsvImportForm({ iptSlug, iptId }: { iptSlug: string; iptId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImportResult(null)
    const file = e.target.files?.[0]
    if (!file) {
      setParseResult(null)
      setFileName(null)
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const result = parseCsvUsers(text)
      setParseResult(result)
    }
    reader.readAsText(file)
  }, [])

  const handleImport = useCallback(async () => {
    if (!parseResult || parseResult.valid.length === 0) return

    setImporting(true)
    setImportResult(null)

    try {
      const res = await fetch(`/${iptSlug}/admin/users/import/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parseResult.valid, iptId }),
      })

      const data: ImportResult = await res.json()
      setImportResult(data)
    } catch {
      setImportResult({
        success: 0,
        failed: parseResult.valid.length,
        errors: [{ ic_number: '-', error: 'Ralat rangkaian. Sila cuba lagi.' }],
      })
    } finally {
      setImporting(false)
    }
  }, [parseResult, iptSlug, iptId])

  const handleReset = useCallback(() => {
    setParseResult(null)
    setImportResult(null)
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const previewRows = parseResult?.valid.slice(0, 10) ?? []
  const hasMore = (parseResult?.valid.length ?? 0) > 10

  return (
    <div className="space-y-6">
      {/* CSV Format Instructions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Format CSV</h2>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 space-y-1">
          <p className="text-gray-500">{'// Baris pertama mestilah header'}</p>
          <p>nama,ic_number,password,role,kelas_latihan</p>
          <p className="text-gray-500">{'// Contoh data:'}</p>
          <p>Ahmad bin Ali,990101145678,password123,ahli,Kelas 1</p>
          <p>Siti Aminah,880202246789,pass456,tenaga_pengajar,Kelas 2</p>
        </div>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p><strong>Wajib:</strong> nama, ic_number</p>
          <p><strong>Pilihan:</strong> password (lalai: ic_number), role (lalai: ahli), kelas_latihan</p>
          <p><strong>Peranan sah:</strong> ahli, tenaga_pengajar, admin</p>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Muat Naik Fail CSV
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer file:transition-colors"
          />
          {parseResult && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              Padam
            </button>
          )}
        </div>
        {fileName && (
          <p className="mt-2 text-xs text-gray-500">Fail: {fileName}</p>
        )}
      </div>

      {/* Parse Errors */}
      {parseResult && parseResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Ralat Parsing ({parseResult.errors.length})
          </h3>
          <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
            {parseResult.errors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Table */}
      {parseResult && parseResult.valid.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Pratonton ({parseResult.valid.length} pengguna)
            </h3>
            {hasMore && (
              <span className="text-xs text-gray-400">
                Menunjukkan 10 daripada {parseResult.valid.length}
              </span>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">No IC</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Peranan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kelas Latihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {previewRows.map((row: CsvUserRow, i: number) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{row.nama}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{row.ic_number}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700">
                      {ROLE_LABELS[row.role ?? 'ahli'] ?? row.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{row.kelas_latihan ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import Button */}
      {parseResult && parseResult.valid.length > 0 && !importResult && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleImport}
            disabled={importing}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {importing && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {importing
              ? 'Mengimport...'
              : `Import ${parseResult.valid.length} Pengguna`}
          </button>
          {importing && (
            <span className="text-sm text-gray-500">Sila tunggu, proses sedang berjalan...</span>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`rounded-xl border p-5 ${
            importResult.failed === 0
              ? 'bg-green-50 border-green-200'
              : importResult.success === 0
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h3 className={`text-sm font-semibold mb-1 ${
              importResult.failed === 0
                ? 'text-green-800'
                : importResult.success === 0
                  ? 'text-red-800'
                  : 'text-yellow-800'
            }`}>
              Keputusan Import
            </h3>
            <p className={`text-sm ${
              importResult.failed === 0
                ? 'text-green-700'
                : importResult.success === 0
                  ? 'text-red-700'
                  : 'text-yellow-700'
            }`}>
              {importResult.success} berjaya, {importResult.failed} gagal
            </p>
          </div>

          {/* Error Details */}
          {importResult.errors.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Ralat Import ({importResult.errors.length})
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">No IC</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ralat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {importResult.errors.map((err, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{err.ic_number}</td>
                      <td className="px-5 py-3 text-red-600 text-xs">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions after import */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Import Lagi
            </button>
            <a
              href={`/${iptSlug}/admin/users`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Lihat Senarai Pengguna
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
