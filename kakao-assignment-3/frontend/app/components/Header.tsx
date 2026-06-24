'use client'

import { ViewMode } from '@/types'
import { formatMonthLabel, formatWeekLabel, formatDayLabel, buildWeekDays } from '@/utils/date'

type Props = {
  focusDate: Date
  viewMode: ViewMode
  onPrev: () => void
  onNext: () => void
  onChangeView: (mode: ViewMode) => void
}

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: 'month', label: '월' },
  { key: 'week', label: '주' },
  { key: 'day', label: '일' },
  { key: 'list', label: '목록' },
]

export default function Header({ focusDate, viewMode, onPrev, onNext, onChangeView }: Props) {
  let periodLabel: string
  if (viewMode === 'month') periodLabel = formatMonthLabel(focusDate)
  else if (viewMode === 'week') periodLabel = formatWeekLabel(buildWeekDays(focusDate))
  else if (viewMode === 'day') periodLabel = formatDayLabel(focusDate)
  else periodLabel = '일정 목록'

  const iconBtn =
    'flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#5f6368] transition hover:bg-[#f1f3f4]'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dadce0] bg-[#f8f9fa] px-4">
      <div className="flex items-center gap-2">
        <div className="mr-2 ml-1 flex items-center gap-2">
          <span className="text-[22px]">📅</span>
          <span className="text-[22px] font-normal text-[#5f6368]">Todo</span>
        </div>
        <div className="flex">
          <button className={iconBtn} aria-label="이전" onClick={onPrev}>‹</button>
          <button className={iconBtn} aria-label="다음" onClick={onNext}>›</button>
        </div>
        <h1 className="ml-2 text-[22px] font-normal whitespace-nowrap text-[#3c4043]">{periodLabel}</h1>
      </div>
      <div className="flex overflow-hidden rounded-lg border border-[#dadce0]">
        {VIEWS.map((view) => (
          <button
            key={view.key}
            onClick={() => onChangeView(view.key)}
            className={`h-9 px-3.5 text-sm transition ${
              viewMode === view.key
                ? 'bg-[#e8f0fe] text-[#1a73e8]'
                : 'bg-white text-[#5f6368] hover:bg-[#f1f3f4]'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </header>
  )
}
