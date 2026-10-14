import { useState, useEffect } from 'react'
import anecdoteService from '../services/anecdotes'



export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }
  const reset = () => {
    setValue('')
  }

  return {
    field:{type,value,onChange},
    reset
  }
}

export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState([])
  useEffect(() => {
    anecdoteService.getAll().then(data => setAnecdotes(data))
  }, [])
  return {anecdotes,setAnecdotes}
}
