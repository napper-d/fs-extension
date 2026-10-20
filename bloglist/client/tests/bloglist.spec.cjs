const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ request, page }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        username: 'admin',
        name: 'admin',
        password: '123456',
      },
    })
    await request.post('/api/users', {
      data: {
        username: 'admin2',
        name: 'admin2',
        password: '123456',
      },
    })

    await page.goto('/')
    await loginWith(page, 'admin2', '123456')
    await createBlog(page, 'blog1', 'author', 'url')
    await createBlog(page, 'blog2', 'author', 'url')
    await page.getByRole('button', { name: 'logout' }).click()
  })

  test('comments remain visible after reload and liking', async ({ page }) => {
    await page.getByRole('link', { name: 'blog1 by author' }).click()
    const comment = 'This comment survives reload and likes'
    await page.getByLabel('content').fill(comment)
    await page.getByRole('button', { name: 'add comment' }).click()
    await expect(page.getByText(comment, { exact: true })).toBeVisible()
    await expect(page.getByLabel('content')).toHaveValue('')
    await page.reload()
    await expect(page.getByText(comment, { exact: true })).toBeVisible()
    await loginWith(page, 'admin', '123456')
    await page.getByRole('link', { name: 'blog1 by author' }).click()
    await page.getByRole('button', { name: 'like', exact: true }).click()
    await expect(page.getByText('1 likes')).toBeVisible()
    await expect(page.getByText(comment, { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText(comment, { exact: true })).toBeVisible()
  })

  describe('the visibility of the components', () => {
    test('Blog information and the number of likes are displayed to unauthenticated users, buttons are not displayed', async ({ page }) => {
      await page.getByRole('link', { name: 'blog1 by author' }).click()
      await expect(page.getByRole('heading', { name: 'blog1' })).toBeVisible()
      await expect(page.getByText('url')).toBeVisible()
      await expect(page.getByText('0 likes')).toBeVisible()
      await expect(page.getByText('Added by admin2')).toBeVisible()

      await expect(page.getByRole('button', { name: 'like' })).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Remove' })).not.toBeVisible()
    })

    test('authenticated users who are not the blog’s creator are shown only the like button', async ({ page }) => {
      await loginWith(page, 'admin', '123456')
      await page.getByRole('link', { name: 'blog1 by author' }).click()
      await expect(page.getByRole('heading', { name: 'blog1' })).toBeVisible()
      await expect(page.getByText('url')).toBeVisible()
      await expect(page.getByText('0 likes')).toBeVisible()
      await expect(page.getByText('Added by admin2')).toBeVisible()

      await expect(page.getByRole('button', { name: 'like' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Remove' })).not.toBeVisible()
    })

    test('The blog’s creator is also shown the delete button', async ({ page }) => {
      await loginWith(page, 'admin2', '123456')
      await page.getByRole('link', { name: 'blog1 by author' }).click()
      await expect(page.getByRole('heading', { name: 'blog1' })).toBeVisible()
      await expect(page.getByText('url')).toBeVisible()
      await expect(page.getByText('0 likes')).toBeVisible()
      await expect(page.getByText('Added by admin2')).toBeVisible()

      await expect(page.getByRole('button', { name: 'like' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible()
    })
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'admin', '123456')
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'admin', '1234567')
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('Creating a new blog', () => {
    test('succeeds', async ({ page }) => {
      await loginWith(page, 'admin', '123456')
      await createBlog(page, 'a new blog', 'author', 'url')
      await expect(page.getByRole('link', { name: 'a new blog by author' })).toBeVisible()
    })
  })

  describe('Liking a blog', () => {
    test('succeeds', async ({ page }) => {
      await loginWith(page, 'admin', '123456')
      await page.getByRole('link', { name: 'blog1 by author' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('1 likes')).toBeVisible()
    })
  })

  describe('Deleting a blog', () => {
    test('delete succeeds', async ({ page }) => {
      await loginWith(page, 'admin2', '123456')
      await page.getByRole('link', { name: 'blog1 by author' }).click()
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByRole('link', { name: 'blog1 by author' })).not.toBeVisible()
    })
    test('only the owner can delete a blog', async ({ page }) => {
      await loginWith(page, 'admin', '123456')
      await page.getByRole('link', { name: 'blog1 by author' }).click()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })
  })

  describe('blogs are sorted by likes', () => {
    test('succeeds', async ({ page }) => {
      await loginWith(page, 'admin', '123456')

      await page.getByRole('link', { name: 'blog2 by author' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.goto('/')

      const blogLinks = page.getByRole('link', { name: / by / })
      await expect(blogLinks.nth(0)).toContainText('blog2 by author')
      await expect(blogLinks.nth(1)).toContainText('blog1 by author')
    })
  })
})