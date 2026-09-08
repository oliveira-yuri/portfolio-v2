import { expect, test } from '@playwright/test'

const SECTIONS = ['hero', 'projects', 'experience', 'education', 'skills', 'posts', 'contact']

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

test('the language switcher moves the visitor to the other language', async ({ page }) => {
  await page.goto('/pt/')
  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/?$/)
})

test('an article opens from the newsletter listing', async ({ page }) => {
  await page.goto('/pt/newsletter/')
  await page.locator('main ul li a').first().click()
  await expect(page.locator('article h1')).toBeVisible()
})

test('an untranslated article shows the notice and links to the version that exists', async ({
  page,
}) => {
  await page.goto('/en/newsletter/exemplo-somente-portugues/')
  const notice = page.getByTestId('translation-missing')
  await expect(notice).toBeVisible()
  await notice.getByRole('link').click()
  await expect(page).toHaveURL(/\/pt\/newsletter\/exemplo-somente-portugues/)
})

test('a case study opens from the home page', async ({ page }) => {
  await page.goto('/pt/')
  await page.locator('#projects a').first().click()
  await expect(page).toHaveURL(/\/pt\/projects\//)
  await expect(page.locator('article h1')).toBeVisible()
})

test('the CV is downloadable', async ({ page, request }) => {
  await page.goto('/pt/')
  const href = await page.locator('#contact a[href$=".pdf"]').first().getAttribute('href')
  expect(href).toBeTruthy()
  const response = await request.get(href as string)
  expect(response.status()).toBe(200)
})
