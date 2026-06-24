import TodoForm from '@/app/components/TodoForm'
import { defaultTimeRange, toDateKey } from '@/utils/date'

type SearchParams = Promise<{
  date?: string
  startTime?: string
  endTime?: string
}>

export default async function NewTodoPage({ searchParams }: { searchParams: SearchParams }) {
  const { date, startTime, endTime } = await searchParams
  const fallback = defaultTimeRange()
  const today = toDateKey(new Date())

  return (
    <TodoForm
      initialDraft={{
        title: '',
        date: date || today,
        startTime: startTime || fallback.startTime,
        endTime: endTime || fallback.endTime,
      }}
    />
  )
}
