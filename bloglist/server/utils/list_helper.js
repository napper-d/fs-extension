const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlogWhole = (blogs) => {
    return _.maxBy(blogs, 'likes')
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const Whole = favoriteBlogWhole(blogs)
    return {
        title: Whole.title,
        author: Whole.author,
        likes: Whole.likes,
    }
}

const BlogsByAuthor = (blogs) => {
    const grouped =  _.groupBy(blogs, 'author')
    const groups = _.values(grouped)
    return groups.map((blogs) => {
        return blogs.reduce((acc, blog) =>{ 
            acc.likes += blog.likes
            return acc
        },
        {author: blogs[0].author, likes: 0, blogs: blogs.length})
    })
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return { author: '', blogs: 0 }
    }
    const blogsByAuthor = BlogsByAuthor(blogs)
    const most = _.maxBy(blogsByAuthor, 'blogs')
    return {
        author: most.author,
        blogs: most.blogs,
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return { author: '', likes: 0 }
    }
    const blogsByAuthor = BlogsByAuthor(blogs)
    const most = _.maxBy(blogsByAuthor, 'likes')
    return {
        author: most.author,
        likes: most.likes,
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}