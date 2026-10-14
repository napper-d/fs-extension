import { useNavigate } from "react-router-dom"
import { useField } from "../hooks"

const CreateNew = ({ addNew }) => {
  const content = useField("text")
  const author = useField("text")
  const info = useField("text")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addNew({ content: content.field.value, author: author.field.value, info: info.field.value, votes: 0 })
    navigate("/")
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input name="content" {...content.field} />
        </div>
        <div>
          author
          <input name="author" {...author.field} />
        </div>
        <div>
          url for more info
          <input name="info" {...info.field} />
        </div>
        <button>create</button>
        <button type="button" onClick={() => {
          content.reset()
          author.reset()
          info.reset()
        }}>reset</button>
      </form>
    </div>
  )
}

export default CreateNew
