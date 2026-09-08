import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'on-first-retry' },
  webServer: {
    command: 'npx serve out -l 4321 --no-clipboard',
    url: 'http://127.0.0.1:4321/pt/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
