import { useState } from 'react'
import { Box, Button, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { useBlogActions, useMessageActions } from '../store'

const InputField = ({ label, value, onChange }) => (
  <TextField
    placeholder={label}
    value={value}
    onChange={onChange}
    slotProps={{ htmlInput: { 'aria-label': label } }}
  />
)

const CreateForm = () => {
  const navigate = useNavigate()
  const { createBlog } = useBlogActions()
  const { showNewBlogMessage } = useMessageActions()

  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })

  const handleFieldChange = field => ({ target }) =>
    setNewBlog(prev => ({ ...prev, [field]: target.value }))

  const handleCreateNewBlog = async event => {
    event.preventDefault()
    await createBlog(newBlog)
    navigate('/')
    showNewBlogMessage(newBlog)
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleCreateNewBlog}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320 }}>
          <InputField label="title" value={newBlog.title} onChange={handleFieldChange('title')} />
          <InputField label="author" value={newBlog.author} onChange={handleFieldChange('author')} />
          <InputField label="url" value={newBlog.url} onChange={handleFieldChange('url')} />
          <Box>
            <Button type="submit" variant="contained" color="primary">
              create
            </Button>
          </Box>
        </Box>
      </form>
    </div>
  )
}

export default CreateForm
