'use client'

import { Fragment, useEffect, useRef } from 'react'
import { Todo } from '@/types'
import { HOURS, WEEKDAY_LABELS, formatHourLabel, isSameDay, pad, toDateKey } from '@/utils/date'
import EventChip from './EventChip'

type Props = {
  days: Date[]
  todos: Todo[]
  onCreate: (opts: { date: string; startTime: string; endTime: string }) => void
  onEditTodo: (todo: Todo) => void
  onDayClick: (date: Date) => void
}

export default function TimeGridView({ days, todos, onCreate, onEditTodo, onDayClick }: Props) {
  const today = new Date()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * 48
  }, [])

  const todosOf = (dateKey: string) =>
    todos
      .filter((t) => t.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const gridCols = { gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid border-b border-[#dadce0]" style={gridCols}>
        <div className="border-r border-[#dadce0]" />
        {days.map((day) => {
          const isToday = isSameDay(day, today)
          const count = todosOf(toDateKey(day)).length
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className="flex flex-col items-center gap-0.5 border-l border-[#dadce0] pt-2 pb-2.5 transition hover:bg-[#f1f3f4]"
            >
              <span className={`text-[11px] ${isToday ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}>
                {WEEKDAY_LABELS[day.getDay()]}
              </span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-[22px] ${isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}`}>
                {day.getDate()}
              </span>
              <span className={`min-h-3.5 text-[11px] ${isToday ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}>
                {count > 0 ? `${count}개` : ''}
              </span>
            </button>
          )
        })}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="grid" style={gridCols}>
          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div className="h-12 -translate-y-1.5 pr-2 text-right text-[10px] text-[#5f6368]">
                {formatHourLabel(hour)}
              </div>
              {days.map((day) => {
                const dateKey = toDateKey(day)
                const startTime = `${pad(hour)}:00`
                const endTime = hour < 23 ? `${pad(hour + 1)}:00` : '23:59'
                const cellTodos = todosOf(dateKey).filter(
                  (t) => parseInt(t.startTime.split(':')[0], 10) === hour,
                )
                return (
                  <div
                    key={dateKey + hour}
                    onClick={() => onCreate({ date: dateKey, startTime, endTime })}
                    className="h-12 border-t border-l border-[#dadce0] transition hover:bg-[#fafafb]"
                  >
                    {cellTodos.map((todo) => (
                      <div key={todo.id} className="m-0.5">
                        <EventChip todo={todo} onClick={() => onEditTodo(todo)} />
                      </div>
                    ))}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
