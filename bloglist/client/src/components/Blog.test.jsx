import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import CreateForm from './CreateForm'
import userEvent from '@testing-library/user-event'

describe('static Blog test', () => {
  const appUser = {
    id: 1,
    username: 'testuser',
    name: 'Test User'
  }
  const blog = {
    id: 1,
    title: 'Component testing is done with react-testing-library',
    author: 'Test User',
    url: 'https://www.test.com',
    likes: 0,
    user: appUser
  }
  const mockLikeHandler = vi.fn()
  const mockDeleteHandler = vi.fn()
  beforeEach(() => {
    render(<Blog blog={blog} appUser={appUser} handleLike={mockLikeHandler} handleDelete={mockDeleteHandler} />)
  })
  test('renders content initially', () => {
    const titleElement = screen.getByText('Component testing is done with react-testing-library', { exact: false })
    expect(titleElement).toBeVisible()
    const authorElement = screen.getByText('Test User', { exact: false })
    expect(authorElement).toBeVisible()
    const urlElement = screen.queryByText('https://www.test.com')
    expect(urlElement).not.toBeInTheDocument()
    const likesElement = screen.queryByText('0')
    expect(likesElement).not.toBeInTheDocument()
  })
  test('show button is clicked', async () => {
    const user = userEvent.setup()
    const showButton = await screen.findByText('view')
    expect(showButton).toBeVisible()
    await user.click(showButton)

    const urlElement = screen.queryByText('https://www.test.com')
    expect(urlElement).toBeVisible()
    const likesElement = screen.queryByText('0')
    expect(likesElement).toBeVisible()
  })
  test('like button is clicked twice', async () => {
    const user = userEvent.setup()

    const showButton = screen.queryByText('view')
    const initialLikeButton = screen.queryByText('like')
    expect(showButton).toBeDefined()
    expect(initialLikeButton).not.toBeInTheDocument()
    await user.click(showButton)

    const likeButton = screen.queryByText('like')
    expect(likeButton).toBeVisible()
    await user.click(likeButton)
    await user.click(likeButton)
    expect(mockLikeHandler.mock.calls).toHaveLength(2)
  })
})

describe('add a new blog to the form', () => {
  const mockCreateBlog = vi.fn()

  beforeEach(() => {
    render(<CreateForm createBlog={mockCreateBlog} />)
    screen.debug()
  })

  test('form is submitted with the right details', async () => {
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('title'), 'New Blog')
    await user.type(screen.getByPlaceholderText('author'), 'New Author')
    await user.type(screen.getByPlaceholderText('url'), 'https://www.newblog.com')
    await user.click(screen.getByText('create'))

    expect(mockCreateBlog.mock.calls).toHaveLength(1)
    expect(mockCreateBlog.mock.calls[0][0]).toEqual({
      title: 'New Blog',
      author: 'New Author',
      url: 'https://www.newblog.com'
    })
  })
})