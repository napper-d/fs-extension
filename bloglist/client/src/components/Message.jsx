import { Alert } from '@mui/material'
import { useMessage } from '../store'

const Message = () => {
  const message = useMessage()
  if (!message || message.message === null) return null
  const severity = message.color === 'red' ? 'error' : 'success'
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {message.message}
    </Alert>
  )
}

export default Message
