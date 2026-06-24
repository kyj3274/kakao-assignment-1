import { getTodos } from '@/app/actions'
import CalendarApp from '@/app/components/CalendarApp'

export default async function TodosPage() {
  const todos = await getTodos()
  return <CalendarApp todos={todos} />
}
