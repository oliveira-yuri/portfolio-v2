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
    // Never reuse a server left running from an earlier run: this suite exists to
    // catch breakage in the static export, and reusing a stale `serve out` process
    // would let it report green against yesterday's build instead of this one.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
