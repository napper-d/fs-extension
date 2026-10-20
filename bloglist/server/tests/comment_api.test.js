const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const api = supertest(app)
let blog
let user

beforeEach(async () => {
  await Comment.deleteMany({})
  await Blog.deleteMany({})
  await User.deleteMany({})
  user = await User.create({ username: 'commenter', name: 'Comment User', passwordHash: 'hidden' })
  blog = await Blog.create({ title: 'A blog', url: 'https://example.com', user: user._id })
  user.blogs.push(blog._id)
  await user.save()
})

test('comments and owner survive creation, fetching and liking a blog', async () => {
  const added = await api.put('/api/blogs/' + blog.id + '/comments')
    .send({ content: '  A useful comment  ' }).expect(201)
  assert.equal(added.body.content, 'A useful comment')
  assert.equal(added.body.blog, blog.id)
  assert.ok(added.body.id)
  assert.equal(added.body._id, undefined)

  const list = await api.get('/api/blogs').expect(200)
  const detail = await api.get('/api/blogs/' + blog.id).expect(200)
  const liked = await api.put('/api/blogs/' + blog.id).send({ likes: 1 }).expect(200)
  for (const result of [list.body[0], detail.body, liked.body]) {
    assert.deepEqual(result.comments, [added.body])
    assert.equal(result.user.id, user.id)
    assert.equal(result.user.name, user.name)
    assert.equal(result.user.passwordHash, undefined)
    assert.equal(result.user.blogs, undefined)
  }
  assert.equal(liked.body.likes, 1)
  const stored = await Blog.findById(blog.id)
  assert.equal(stored.comments[0].toString(), added.body.id)
})

test('new blogs return a populated owner and an empty comment array', async () => {
  const token = jwt.sign({ id: user.id }, process.env.SECRET)
  const result = await api.post('/api/blogs').set('Authorization', 'Bearer ' + token)
    .send({ title: 'New blog', url: 'https://example.com/new' }).expect(201)
  assert.deepEqual(result.body.comments, [])
  assert.equal(result.body.user.id, user.id)
  const users = await api.get('/api/users').expect(200)
  assert.equal(users.body[0].blogs.length, 2)
  assert.ok(users.body[0].blogs.some(item => item.id === result.body.id && item.title === 'New blog'))
  assert.equal(users.body[0].passwordHash, undefined)
})

test('blank or missing comments are rejected without changing the blog', async () => {
  for (const body of [{}, { content: '' }, { content: '   ' }]) {
    await api.put('/api/blogs/' + blog.id + '/comments').send(body).expect(400)
  }
  assert.equal(await Comment.countDocuments({}), 0)
  assert.equal((await Blog.findById(blog.id)).comments.length, 0)
})

test('comments for missing blogs do not create orphan documents', async () => {
  const id = new mongoose.Types.ObjectId().toString()
  await api.put('/api/blogs/' + id + '/comments').send({ content: 'Hello' }).expect(404)
  await api.get('/api/blogs/' + id).expect(404)
  assert.equal(await Comment.countDocuments({}), 0)
})

test('malformed blog ids are rejected before saving comments', async () => {
  await api.put('/api/blogs/invalid/comments').send({ content: 'Hello' }).expect(400)
  assert.equal(await Comment.countDocuments({}), 0)
})

test('concurrent comments both remain associated with the blog', async () => {
  await Promise.all(['First', 'Second'].map(content =>
    api.put('/api/blogs/' + blog.id + '/comments').send({ content }).expect(201)))
  const result = await api.get('/api/blogs/' + blog.id).expect(200)
  assert.deepEqual(result.body.comments.map(item => item.content).sort(), ['First', 'Second'])
})

test('deleting a blog also removes its comments and owner reference', async () => {
  await api.put('/api/blogs/' + blog.id + '/comments').send({ content: 'Hello' }).expect(201)
  const token = jwt.sign({ id: user.id }, process.env.SECRET)
  await api.delete('/api/blogs/' + blog.id).set('Authorization', 'Bearer ' + token).expect(204)
  assert.equal(await Comment.countDocuments({}), 0)
  assert.equal((await User.findById(user.id)).blogs.length, 0)
})

after(async () => {
  await mongoose.connection.close()
})
