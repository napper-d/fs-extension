import { useState } from 'react'
import { Alert, Box, Button, TextField } from '@mui/material'
import { useBlogActions } from '../store'

const InputField = ({ label, value, onChange, ...rest }) => (
  <TextField
    {...rest}
    placeholder={label}
    value={value}
    onChange={onChange}
    slotProps={{ htmlInput: { 'aria-label': label } }}
  />
)

const CommentForm = ({ blogId }) => {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const { addComment } = useBlogActions()

  const handleAddComment = async (event) => {
    event.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await addComment(content.trim(), blogId)
      setContent('')
    } catch (error) {
      setError(error.response?.data?.error || 'Could not add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div>
      <form onSubmit={handleAddComment}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            maxWidth: 480,
          }}
        >
          <InputField
            label="comment"
            value={content}
            onChange={({ target }) => setContent(target.value)}
            sx={{ flex: 1 }}
          />
          <Button type="submit" variant="contained" color="primary" size="large" disabled={submitting || !content.trim()}>
            add comment
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </div>
  )
}
export default CommentForm
