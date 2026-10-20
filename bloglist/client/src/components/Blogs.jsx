import { Link } from 'react-router-dom'
import { Chip, List, ListItem, ListItemButton, ListItemText, Paper } from '@mui/material'
import { useBlogs } from '../store'

const Blogs = () => {
  const blogs = useBlogs()

  return (
    <Paper variant="outlined">
      <List disablePadding>
        {[...blogs]
          .sort((a, b) => b.likes - a.likes)
          .map((blog) => (
            <ListItem key={blog.id} divider disablePadding>
              <ListItemButton component={Link} to={`/blogs/${blog.id}`}>
                <ListItemText
                  primary={`${blog.title} by ${blog.author}`}
                  slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Paper>
  )
}

export default Blogs
