'use client'

import { Todo } from '@/types'

type Props = {
  todo: Todo
  onClick: () => void
}

export default function EventChip({ todo, onClick }: Props) {
  return (
    <div
      title={`${todo.title} (${todo.startTime}–${todo.endTime})`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex cursor-pointer items-center gap-1 overflow-hidden rounded bg-[#1a73e8] px-1.5 py-0.5 text-[11px] whitespace-nowrap text-white ${
        todo.done ? 'line-through opacity-50' : ''
      }`}
    >
      <span className="shrink-0 font-medium opacity-90">{todo.startTime}</span>
      <span className="overflow-hidden text-ellipsis">{todo.title}</span>
    </div>
  )
}
