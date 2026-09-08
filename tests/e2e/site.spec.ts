import { expect, test } from '@playwright/test'

const SECTIONS = ['hero', 'projects', 'experience', 'education', 'skills', 'posts', 'contact']

const POST_SLUG = 'regra-explicita-vs-modelo'
const PROJECT_SLUG = 'integracao-leads-salesforce'

test.describe('home', () => {
  for (const lang of ['pt', 'en']) {
    test(`renders all seven sections in ${lang}`, async ({ page }) => {
      await page.goto(`/${lang}/`)
      for (const id of SECTIONS) {
        await expect(page.locator(`#${id}`)).toHaveCount(1)
      }
    })
  }

  test('shows different copy per language', async ({ page }) => {
    await page.goto('/pt/')
    const pt = await page.locator('#contact h2').textContent()
    await page.goto('/en/')
    const en = await page.locator('#contact h2').textContent()
    expect(pt).not.toBe(en)
  })
})

test('the language switcher keeps the visitor on the equivalent page', async ({ page }) => {
  await page.goto(`/pt/newsletter/${POST_SLUG}/`)

  const toEnglish = page.getByRole('link', { name: 'EN', exact: true })
  // The href starts as the English home and is rewritten on hydration; waiting
  // for the rewritten value both proves the swap happened and keeps the click
  // from racing hydration.
  await expect(toEnglish).toHaveAttribute('href', `/en/newsletter/${POST_SLUG}/`)
  await toEnglish.click()

  await expect(page).toHaveURL(new RegExp(`/en/newsletter/${POST_SLUG}/?$`))
  await expect(page.locator('article h1')).toBeVisible()
})

test('the language switcher still moves home to home', async ({ page }) => {
  await page.goto('/pt/')
  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/?$/)
})

test('an article opens from the newsletter listing', async ({ page }) => {
  await page.goto('/pt/newsletter/')
  await page.locator('main ul li a').first().click()
  await expect(page.locator('article h1')).toBeVisible()
})

test('the newsletter offers a feed that parses as RSS', async ({ page, request }) => {
  await page.goto('/pt/newsletter/')
  const feed = page.locator('main a[href$="rss.xml"]')
  await expect(feed).toBeVisible()

  const response = await request.get((await feed.getAttribute('href')) as string)
  expect(response.status()).toBe(200)
  const body = await response.text()
  expect(body).toContain('<channel>')
  expect(body).toContain('<item>')
})

// The "no translation" notice has no e2e coverage right now: it needs content
// that exists in one language only, and everything published today is
// translated. The logic behind it is covered in tests/unit/posts.test.ts
// against fixtures. Restore a case here the first time an untranslated article
// ships.

test('a case study opens from the home page', async ({ page }) => {
  await page.goto('/pt/')
  await page.locator('#projects a').first().click()
  await expect(page).toHaveURL(new RegExp(`/pt/projects/${PROJECT_SLUG}/?$`))
  await expect(page.locator('article h1')).toBeVisible()
})

test('the CV is downloadable', async ({ page, request }) => {
  await page.goto('/pt/')
  const href = await page.locator('#contact a[href$=".pdf"]').first().getAttribute('href')
  expect(href).toBeTruthy()
  const response = await request.get(href as string)
  expect(response.status()).toBe(200)
  const body = await response.body()
  expect(body.subarray(0, 4).toString()).toBe('%PDF')
  // A 15-byte "%PDF-1.4 %%EOF" stub would pass the header check above.
  expect(body.length).toBeGreaterThan(10_000)
})
