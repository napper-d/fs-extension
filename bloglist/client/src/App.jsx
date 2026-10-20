import { useEffect } from 'react'
import {
  Routes, Route, Link
} from 'react-router-dom'
import { AppBar, Button, Container, Toolbar, Typography } from '@mui/material'

import Blog from './components/Blog'
import Blogs from './components/Blogs'
import LoginForm from './components/LogInForm'
import LogoutButton from './components/LogoutButton'
import CreateForm from './components/CreateForm'
import Message from './components/Message'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './components/NotFound'
import Users from './components/Users'
import User from './components/User'

import { useBlogActions, useUser, useUserActions } from './store'

const App = () => {
  const user = useUser()
  const { initBlogs } = useBlogActions()
  const { initUser } = useUserActions()

  useEffect(() => {
    initBlogs()
  }, [initBlogs])
  useEffect(() => {
    initUser()
  }, [initUser])

  const navButtonSx = { color: 'inherit' }
  return (
    <Container>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blog App
          </Typography>
          <Button component={Link} to="/" sx={navButtonSx}>blogs</Button>
          <Button component={Link} to="/users" sx={navButtonSx}>users</Button>
          {!user && <Button component={Link} to="/login" sx={navButtonSx}>login</Button>}
          {user && <Button component={Link} to="/create" sx={navButtonSx}>new blog</Button>}
          {user && <LogoutButton/>}
        </Toolbar>
      </AppBar>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={
            <div>
              <h2>blogs</h2>
              <Message/>
              <Blogs/>
            </div>
          } />
          <Route path="/users" element={
            <Users/>
          } />
          <Route path="/login" element={
            <LoginForm/>
          } />
          <Route path="/create" element={
            <CreateForm/>
          } />
          <Route path="/blogs/:id" element={
            <Blog/>
          } />
          <Route path="/users/:id" element={
            <User/>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Container>
  )
}

export default App