export type Todo = {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  done: boolean
}

export type ModalDraft = {
  title: string
  date: string
  startTime: string
  endTime: string
}

export type ViewMode = 'month' | 'week' | 'day' | 'list'

export type TodoStatus = 'upcoming' | 'inProgress' | 'completed' | 'overdue'
