'use client'

import { Todo } from '@/types'
import MiniCalendar from './MiniCalendar'

type Props = {
  focusDate: Date
  onSetFocusDate: (date: Date) => void
  onCreate: () => void
}

export default function Sidebar({ focusDate, onSetFocusDate, onCreate }: Props) {
  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-r border-[#dadce0] p-4">
      <button
        onClick={onCreate}
        className="flex h-12 items-center gap-2.5 rounded-3xl border border-[#dadce0] bg-white pr-5 pl-4 text-sm text-[#3c4043] shadow-sm transition hover:bg-[#f1f3f4] hover:shadow"
      >
        <span className="text-[22px] leading-none text-[#1a73e8]">＋</span>
        <span>만들기</span>
      </button>
      <MiniCalendar focusDate={focusDate} onSelectDate={onSetFocusDate} />
    </aside>
  )
}
