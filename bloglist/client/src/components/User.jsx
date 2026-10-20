import { useMatch } from 'react-router-dom'
import { useEffect } from 'react'
import { useUsers, useUsersActions, useUsersLoaded } from '../store'
import NotFound from './NotFound'

const User = () => {
  const { initUsers } = useUsersActions()
  useEffect(() => {
    initUsers()
  }, [initUsers])
  const match = useMatch('/users/:id')
  const users = useUsers()
  const loaded = useUsersLoaded()
  console.log(loaded)
  if (!loaded) {
    return null
  }
  const user = match
    ?users.find(b => b.id === match.params.id)
    :null
  if (!user) {
    return <NotFound/>
  }
  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <div>{user.blogs.map(blog =>
        <li key={blog.id}>
          {blog.title}
        </li>
      )}</div>
    </div>
  )
}

export default User
