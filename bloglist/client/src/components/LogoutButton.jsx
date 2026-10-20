import { Button } from '@mui/material'
import { useUserActions } from '../store'

const LogoutButton = () => {
  const { logout } = useUserActions()
  return (
    <Button onClick={logout} sx={{ color: 'inherit' }}>logout</Button>
  )
}

export default LogoutButton
