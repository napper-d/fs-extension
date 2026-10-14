import { test, expect } from '@playwright/test'

const createAnecdote = async (page, { content, author, info }) => {
  await page.getByRole('link', { name: 'create new' }).click()
  const inputs = page.locator('form input')
  await inputs.nth(0).fill(content)
  await inputs.nth(1).fill(author)
  await inputs.nth(2).fill(info)
  await page.getByRole('button', { name: 'create' }).click()
}

test.describe('Anecdote app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('a new anecdote can be created', async ({ page }) => {
    const content = `an anecdote created by playwright ${Date.now()}`

    await createAnecdote(page, {
      content,
      author: 'Playwright',
      info: 'https://playwright.dev',
    })

    await expect(page).toHaveURL('/')
    await expect(page.getByText(content)).toBeVisible()
  })

  test('an anecdote can be deleted', async ({ page }) => {
    const content = `an anecdote to be deleted ${Date.now()}`

    await createAnecdote(page, {
      content,
      author: 'Playwright',
      info: 'https://playwright.dev',
    })

    const item = page.locator('li', { hasText: content })
    await expect(item).toBeVisible()

    await item.getByRole('button', { name: 'delete' }).click()

    await expect(page.getByText(content)).toHaveCount(0)
  })
})
