import type { Role } from '@/lib/types'

export interface CsvUserRow {
  ic_number: string
  nama: string
  password?: string
  kelas_latihan?: string
  role?: Role
}

export interface CsvParseResult {
  valid: CsvUserRow[]
  errors: { row: number; message: string }[]
}

const VALID_IC_RE = /^\d{12}$/

export function parseCsvUsers(csvText: string): CsvParseResult {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) {
    return { valid: [], errors: [{ row: 0, message: 'Fail CSV kosong atau tiada data' }] }
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const icIdx = headers.indexOf('ic_number')
  const namaIdx = headers.indexOf('nama')
  const passwordIdx = headers.indexOf('password')
  const kelasIdx = headers.indexOf('kelas_latihan')
  const roleIdx = headers.indexOf('role')

  if (icIdx === -1) {
    return { valid: [], errors: [{ row: 0, message: 'Lajur ic_number diperlukan' }] }
  }
  if (namaIdx === -1) {
    return { valid: [], errors: [{ row: 0, message: 'Lajur nama diperlukan' }] }
  }

  const valid: CsvUserRow[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim())
    const icNumber = cols[icIdx] ?? ''
    const nama = cols[namaIdx] ?? ''

    if (!icNumber) {
      errors.push({ row: i + 1, message: `Baris ${i + 1}: ic_number kosong` })
      continue
    }
    if (!VALID_IC_RE.test(icNumber)) {
      errors.push({ row: i + 1, message: `Baris ${i + 1}: ic_number mesti 12 digit` })
      continue
    }
    if (!nama) {
      errors.push({ row: i + 1, message: `Baris ${i + 1}: nama kosong` })
      continue
    }

    valid.push({
      ic_number: icNumber,
      nama,
      password: passwordIdx !== -1 ? cols[passwordIdx] || undefined : undefined,
      kelas_latihan: kelasIdx !== -1 ? cols[kelasIdx] || undefined : undefined,
      role: roleIdx !== -1 ? (cols[roleIdx] as Role) || 'ahli' : 'ahli',
    })
  }

  return { valid, errors }
}
