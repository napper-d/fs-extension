import { useAnecdotes } from "../hooks"

const AnecdoteList = () =>{
  const {anecdotes, deleteAnecdote} = useAnecdotes()
  return(
    <div>
      <h2>Anecdotes</h2>
      <ul>
        {anecdotes.map(anecdote =>
          <div>
            <li key={anecdote.id}>{anecdote.content}</li>
            <button onClick={() => deleteAnecdote(anecdote.id)}>delete</button>
          </div>
        )}
      </ul>
    </div>
  )
}

export default AnecdoteList
