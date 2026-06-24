import { Todo, TodoStatus } from '@/types'

export function getTodoStatus(todo: Todo, now = new Date()): TodoStatus {
  if (todo.done) return 'completed'
  const start = new Date(`${todo.date}T${todo.startTime}`)
  const end = new Date(`${todo.date}T${todo.endTime}`)
  if (now < start) return 'upcoming'
  if (now > end) return 'overdue'
  return 'inProgress'
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
  upcoming: '예정',
  inProgress: '진행중',
  completed: '완료',
  overdue: '지난',
}

export const STATUS_STYLES: Record<TodoStatus, { badge: string; bar: string }> = {
  upcoming: { badge: 'bg-blue-50 text-blue-700', bar: 'border-l-blue-500' },
  inProgress: { badge: 'bg-amber-50 text-amber-700', bar: 'border-l-amber-500' },
  completed: { badge: 'bg-green-50 text-green-700', bar: 'border-l-green-600' },
  overdue: { badge: 'bg-red-50 text-red-700', bar: 'border-l-red-500' },
}
