'use client'

import { Todo } from '@/types'
import { WEEKDAY_LABELS, buildMonthDays, isSameDay, toDateKey } from '@/utils/date'
import EventChip from './EventChip'

type Props = {
  focusDate: Date
  todos: Todo[]
  onCreate: (opts: { date: string }) => void
  onEditTodo: (todo: Todo) => void
}

export default function MonthView({ focusDate, todos, onCreate, onEditTodo }: Props) {
  const today = new Date()
  const days = buildMonthDays(focusDate)

  const todosOf = (dateKey: string) =>
    todos
      .filter((t) => t.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-[#dadce0]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-3 py-2 text-right text-[11px] tracking-wide text-[#5f6368]">
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day)
          const isOtherMonth = day.getMonth() !== focusDate.getMonth()
          const isSunday = day.getDay() === 0
          const isToday = isSameDay(day, today)
          let dateClass = 'text-[#3c4043]'
          if (isOtherMonth) dateClass = 'text-[#bdc1c6]'
          else if (isSunday) dateClass = 'text-[#d93025]'
          if (isToday) dateClass = 'bg-[#1a73e8] text-white'
          return (
            <div
              key={dateKey}
              onClick={() => onCreate({ date: dateKey })}
              className="flex min-h-0 flex-col items-center overflow-hidden border-r border-b border-[#dadce0] p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0 hover:bg-[#fafafb]"
            >
              <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs ${dateClass}`}>
                {day.getDate()}
              </div>
              <div className="mt-0.5 flex w-full flex-col gap-0.5 overflow-hidden">
                {todosOf(dateKey).map((todo) => (
                  <EventChip key={todo.id} todo={todo} onClick={() => onEditTodo(todo)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
