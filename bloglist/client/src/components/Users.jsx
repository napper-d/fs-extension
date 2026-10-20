import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { useUsers, useUsersActions } from '../store'

const Users = () => {
  const { initUsers } = useUsersActions()
  useEffect(() => {
    initUsers()
  }, [initUsers])
  const users = useUsers()
  return (
    <div>
      <h2>Users</h2>
      <TableContainer>
        <Table>
          <TableHead sx={{ '& .MuiTableCell-head': { fontWeight: 'bold' } }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Blogs created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.username}>
                <TableCell><Link to={`/users/${user.id}`}>{user.name}</Link></TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.blogs.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
export default Users
