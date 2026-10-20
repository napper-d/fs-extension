const loginWith = async (page, username, password) => {
  await page.getByRole('link', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  // 先注册监听再点击，等待登录请求真正返回，避免后续步骤与登录状态更新竞态
  const loginFinished = page.waitForResponse(
    resp => resp.url().includes('/api/login') && resp.request().method() === 'POST'
  )
  await page.getByRole('button', { name: 'login' }).click()
  await loginFinished
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('link', { name: 'new blog' }).click()
  await page.getByLabel('title').fill(title)
  await page.getByLabel('author').fill(author)
  await page.getByLabel('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  // 等待新博客出现在列表中，确认创建流程（POST + 跳转回首页）真正完成
  await page.getByRole('link', { name: `${title} by ${author}` }).waitFor()
}


export { loginWith, createBlog }