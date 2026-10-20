import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material'
import { useNavigate, useMatch } from 'react-router-dom'

import NotFound from './NotFound'
import CommentForm from './CommentForm'

import { useBlogs, useLoaded, useBlogActions, useUser } from '../store'

const Blog = () => {
  const blogs = useBlogs()
  const loaded = useLoaded()
  const appUser = useUser()

  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find((b) => b.id === match.params.id) : null
  const { likeBlog, deleteBlog } = useBlogActions()
  const navigate = useNavigate()

  if (!loaded) {
    return null
  }
  if (!blog) {
    return <NotFound />
  }

  return (
    <div>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {blog.title}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            by {blog.author}
          </Typography>
          <Typography gutterBottom>
            <Link href={blog.url}>{blog.url}</Link>
          </Typography>
          <Typography gutterBottom>Added by {blog.user.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{blog.likes} likes</Typography>
            {appUser && (
              <Button variant="outlined" onClick={() => likeBlog(blog)}>
                like
              </Button>
            )}
            {blog.user?.id === appUser?.id && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
                    deleteBlog(blog)
                    navigate('/')
                  }
                }}
              >
                remove
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 2 }}>
        comments
      </Typography>
      <CommentForm blogId={blog.id} />
      <Paper variant="outlined" sx={{ mt: 2 }}>
        <List disablePadding>
          {blog.comments.map((comment) => (
            <ListItem key={comment.id} divider disablePadding>
              <ListItemText primary={comment.content} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  )
}

export default Blog
