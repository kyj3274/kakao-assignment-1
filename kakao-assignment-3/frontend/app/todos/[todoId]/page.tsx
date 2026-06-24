import { notFound } from 'next/navigation'
import { getTodos } from '@/app/actions'
import TodoForm from '@/app/components/TodoForm'

type Params = Promise<{ todoId: string }>

export default async function TodoDetailPage({ params }: { params: Params }) {
  const { todoId } = await params
  const todos = await getTodos()
  const todo = todos.find((t) => t.id === Number(todoId))

  if (!todo) notFound()

  return (
    <TodoForm
      editingId={todo.id}
      initialDraft={{
        title: todo.title,
        date: todo.date,
        startTime: todo.startTime,
        endTime: todo.endTime,
      }}
    />
  )
}
