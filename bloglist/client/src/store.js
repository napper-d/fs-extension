import { create } from 'zustand'
import blogService from './services/BlogService'
import loginService from './services/LoginService'
import userService from './services/UserService'

const useMessageStore = create((set) => ({
  message : null,
  actions : {
    showNewBlogMessage : async (blogObject) => {
      const message = `a new blog ${blogObject.title} by ${blogObject.author} added`
      set({ message : { message, color : 'green' } })
      setTimeout(() => {
        set({ message : null })
      }, 5000)
    },
    showErrorMessage : async () => {
      const message = 'wrong username or password'
      set({ message : { message, color : 'red' } })
      setTimeout(() => {
        set({ message : null })
      }, 5000)
    }
  }
}))

export const useMessage = () => useMessageStore((state) => state.message)
export const useMessageActions = () => useMessageStore((state) => state.actions)

const useBlogStore = create((set, get) => ({
  blogs : [],
  loaded : false,
  actions : {
    initBlogs : async () => {
      const blogs = await blogService.getAll()
      set({ blogs, loaded : true })
    },
    createBlog : async (blogObject) => {
      const newBlog = await blogService.create(blogObject)
      set({ blogs : [...get().blogs, newBlog] })
    },
    getBlog : (id) => {
      return get().blogs.find(b => b.id === id)
    },
    likeBlog : async (blog) => {
      const updatedBlog = await blogService.update(blog.id, {
        ...blog,
        likes: blog.likes + 1
      })
      set({ blogs : get().blogs.map(b => b.id === blog.id ? updatedBlog : b) })
    },
    deleteBlog : async (blog) => {
      await blogService.remove(blog.id)
      set({ blogs : get().blogs.filter(b => b.id !== blog.id) })
    },
    addComment : async (content, blogId) => {
      const newComment = await blogService.addComment(blogId, { content })
      set({ blogs : get().blogs.map(b => b.id === blogId ? { ...b, comments: [...b.comments, newComment] } : b) })
    }
  }
}))

export const useBlogs = () => useBlogStore((state) => state.blogs)
export const useLoaded = () => useBlogStore((state) => state.loaded)
export const useBlogActions = () => useBlogStore((state) => state.actions)


const useUserStore = create((set,get) => ({
  user : null,
  username : '',
  password : '',
  actions : {
    setUsername : (username) => set({ username }),
    setPassword : (password) => set({ password }),
    initUser : () => {
      const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
      if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON)
        set({ user })
        blogService.setToken(user.token)
      }
    },
    login : async () => {
      const { username, password } = get()
      const user = await loginService.login({ username, password })
      set({ user })
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
    },
    logout : () => {
      set({ user : null, userName : '', password : '' })
      blogService.setToken('')
      window.localStorage.removeItem('loggedNoteappUser')
    }
  }
}))

export const useUser = () => useUserStore((state) => state.user)
export const useUserName = () => useUserStore((state) => state.username)
export const usePassword = () => useUserStore((state) => state.password)
export const useUserActions = () => useUserStore((state) => state.actions)

const useUsersStore = create((set) => ({
  users : [],
  loaded : false,
  actions : {
    initUsers : async () => {
      const users = await userService.getAll()
      set({ users, loaded : true })
    }
  }
}))

export const useUsers = () => useUsersStore((state) => state.users)
export const useUsersLoaded = () => useUsersStore((state) => state.loaded)
export const useUsersActions = () => useUsersStore((state) => state.actions)
