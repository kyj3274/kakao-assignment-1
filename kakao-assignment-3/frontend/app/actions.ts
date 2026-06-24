'use server'

import axios from 'axios'
import { revalidatePath } from 'next/cache'
import { Todo, ModalDraft } from '@/types'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function getTodos(): Promise<Todo[]> {
  const res = await axios.get(`${BACKEND_URL}/todos`)
  return res.data
}

export async function createTodo(data: ModalDraft): Promise<Todo> {
  const res = await axios.post(`${BACKEND_URL}/todos`, data)
  revalidatePath('/todos')
  return res.data
}

export async function updateTodo(id: number, data: Partial<ModalDraft>): Promise<Todo> {
  const res = await axios.put(`${BACKEND_URL}/todos/${id}`, data)
  revalidatePath('/todos')
  return res.data
}

export async function deleteTodo(id: number): Promise<void> {
  await axios.delete(`${BACKEND_URL}/todos/${id}`)
  revalidatePath('/todos')
}

export async function toggleTodo(id: number): Promise<Todo> {
  const res = await axios.patch(`${BACKEND_URL}/todos/${id}/toggle`)
  revalidatePath('/todos')
  return res.data
}
