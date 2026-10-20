const getUser = () => {
  const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
  return JSON.parse(loggedUserJSON)
}
const saveUser = (user) => {
  window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
}
const removeUser = () => {
  window.localStorage.removeItem('loggedNoteappUser')
}
export default { getUser, saveUser, removeUser }
