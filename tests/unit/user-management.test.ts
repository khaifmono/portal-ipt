import { describe, it, expect } from 'vitest'
import { parseCsvUsers } from '@/lib/csv-parser'

describe('parseCsvUsers', () => {
  const validCsv = `ic_number,nama,kelas_latihan
990101145678,Ahmad Zulkifli,Kelas A
881212076543,Siti Rahayu,Kelas B`

  it('correctly maps ic_number, nama, kelas_latihan columns', () => {
    const result = parseCsvUsers(validCsv)
    expect(result.errors).toHaveLength(0)
    expect(result.valid).toHaveLength(2)
    expect(result.valid[0].ic_number).toBe('990101145678')
    expect(result.valid[0].nama).toBe('Ahmad Zulkifli')
    expect(result.valid[0].kelas_latihan).toBe('Kelas A')
  })

  it('defaults role to ahli when column absent', () => {
    const result = parseCsvUsers(validCsv)
    expect(result.valid[0].role).toBe('ahli')
  })

  it('rejects rows with missing IC number', () => {
    const csv = `ic_number,nama
,Tanpa IC
990101145678,Ada IC`
    const result = parseCsvUsers(csv)
    expect(result.errors).toHaveLength(1)
    expect(result.valid).toHaveLength(1)
  })

  it('rejects rows with IC number not 12 digits', () => {
    const csv = `ic_number,nama
12345,Pendek`
    const result = parseCsvUsers(csv)
    expect(result.errors).toHaveLength(1)
    expect(result.valid).toHaveLength(0)
  })

  it('returns error when ic_number column missing', () => {
    const csv = `nama,kelas_latihan
Ahmad,Kelas A`
    const result = parseCsvUsers(csv)
    expect(result.errors[0].message).toMatch(/ic_number/)
  })
})
