import { describe, it, expect } from 'vitest'

describe('test runner sanity', () => {
  it('runs tests correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('path alias resolves', async () => {
    // Verifies @/* alias works — will fail if vitest.config.ts alias is broken
    const mod = await import('@/tests/utils/supabase-mock')
    expect(mod.createSupabaseMock).toBeDefined()
  })
})
