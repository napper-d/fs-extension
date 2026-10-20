const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')

const middleware = require('../utils/middleware')

const blogPopulation = [
  { path: 'user', select: 'username name' },
  { path: 'comments', select: 'content blog' },
]

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate(blogPopulation)
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate(blogPopulation)
  if (!blog) {
    return response.status(404).end()
  }
  response.json(blog)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog.id)
  await user.save()
  const populated = await savedBlog.populate(blogPopulation)
  response.status(201).json(populated)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if(!blog) {
    return response.status(403).end()
  }
  if(blog.user.toString() !== user.id.toString()) {
    return response.status(403).end()
  }
  await Blog.findByIdAndDelete(request.params.id)
  await User.findByIdAndUpdate(blog.user, { $pull: { blogs: blog._id } })
  await Comment.deleteMany({ blog: blog._id })
  response.status(204).end()
})

blogsRouter.put('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  const body = request.body
  const comment = new Comment({
    content: body.content,
    blog: blog._id,
  })
  const savedComment = await comment.save()
  await Blog.findByIdAndUpdate(blog._id, { $push: { comments: savedComment._id } })
  response.status(201).json(savedComment)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title: body.title, author: body.author, url: body.url, likes: body.likes },
    { returnDocument: 'after', runValidators: true, context: 'query' }
  ).populate(blogPopulation)

  if (!blog) {
    return response.status(404).end()
  }

  response.json(blog)
})

module.exports = blogsRouter
