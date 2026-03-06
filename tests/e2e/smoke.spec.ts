import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})

test('unknown IPT slug shows 404', async ({ page }) => {
  const response = await page.goto('/unknown-ipt-that-does-not-exist')
  expect(response?.status()).toBe(404)
})
