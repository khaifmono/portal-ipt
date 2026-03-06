import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/auth'

describe('loginSchema', () => {
  it('rejects empty IC number', () => {
    const result = loginSchema.safeParse({ ic_number: '', password: 'abc123' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = loginSchema.safeParse({ ic_number: '123456789012', password: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejects IC number with dashes', () => {
    const result = loginSchema.safeParse({ ic_number: '990101-14-5678', password: 'abc123' })
    expect(result.success).toBe(false)
  })

  it('rejects IC number that is not 12 digits', () => {
    const result = loginSchema.safeParse({ ic_number: '1234567890', password: 'abc123' })
    expect(result.success).toBe(false)
  })

  it('accepts valid 12-digit IC and password', () => {
    const result = loginSchema.safeParse({ ic_number: '990101145678', password: 'abc123' })
    expect(result.success).toBe(true)
  })
})
