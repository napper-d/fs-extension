import { Box, Button, TextField } from '@mui/material'
import Message from './Message'
import { useNavigate } from 'react-router-dom'
import { useMessageActions, useUserName, usePassword, useUserActions } from '../store'

const LoginForm = () => {
  const navigate = useNavigate()
  const { showErrorMessage } = useMessageActions()
  const { setUsername, setPassword, login } = useUserActions()
  const username = useUserName()
  const password = usePassword()

  const handleLogin = async event => {
    event.preventDefault()
    try {
      await login()
      navigate('/')
    } catch {
      showErrorMessage()
    }
  }

  return (
    <div>
      <Message/>

      <h2>log in to application</h2>
      <form onSubmit={handleLogin}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320 }}>
          <TextField
            label="username"
            variant="standard"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
          <TextField
            label="password"
            variant="standard"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
          <Box>
            <Button type="submit" variant="contained" color="primary">
              login
            </Button>
          </Box>
        </Box>
      </form>

    </div>
  )
}

export default LoginForm
