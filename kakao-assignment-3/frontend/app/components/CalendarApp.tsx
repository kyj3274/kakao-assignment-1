'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Todo, ViewMode } from '@/types'
import { addDays, buildWeekDays, toDateKey, defaultTimeRange } from '@/utils/date'
import Header from './Header'
import Sidebar from './Sidebar'
import MonthView from './MonthView'
import TimeGridView from './TimeGridView'
import ListView from './ListView'

export default function CalendarApp({ todos }: { todos: Todo[] }) {
  const router = useRouter()
  const [focusDate, setFocusDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  /* ---- 페이지 이동으로 생성/수정 ---- */

  const openCreate = ({ date, startTime, endTime }: { date?: string; startTime?: string; endTime?: string } = {}) => {
    const targetDate = date || toDateKey(focusDate)
    const isToday = targetDate === toDateKey(new Date())
    const fallback = isToday ? defaultTimeRange() : { startTime: '09:00', endTime: '10:00' }
    const params = new URLSearchParams({
      date: targetDate,
      startTime: startTime || fallback.startTime,
      endTime: endTime || fallback.endTime,
    })
    router.push(`/todos/new?${params}`)
  }

  const openEdit = (todo: Todo) => {
    router.push(`/todos/${todo.id}`)
  }

  /* ---- 기간 이동 ---- */

  const movePeriod = (direction: number) => {
    if (viewMode === 'month')
      setFocusDate(new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1))
    else if (viewMode === 'week')
      setFocusDate(addDays(focusDate, 7 * direction))
    else if (viewMode === 'day')
      setFocusDate(addDays(focusDate, direction))
    // list 모드에서는 이전/다음 버튼 비활성
  }

  const changeView = (mode: ViewMode) => {
    setViewMode(mode)
    if (mode === 'day') setFocusDate(new Date())
  }

  const goToDay = (date: Date) => {
    setFocusDate(date)
    setViewMode('day')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-[#3c4043]">
      <Header
        focusDate={focusDate}
        viewMode={viewMode}
        onPrev={() => movePeriod(-1)}
        onNext={() => movePeriod(1)}
        onChangeView={changeView}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          focusDate={focusDate}
          onSetFocusDate={setFocusDate}
          onCreate={() => openCreate()}
        />
        <main className="flex min-w-0 flex-1 flex-col">
          {viewMode === 'month' && (
            <MonthView focusDate={focusDate} todos={todos} onCreate={openCreate} onEditTodo={openEdit} />
          )}
          {viewMode === 'week' && (
            <TimeGridView days={buildWeekDays(focusDate)} todos={todos} onCreate={openCreate} onEditTodo={openEdit} onDayClick={goToDay} />
          )}
          {viewMode === 'day' && (
            <TimeGridView days={[new Date(focusDate)]} todos={todos} onCreate={openCreate} onEditTodo={openEdit} onDayClick={goToDay} />
          )}
          {viewMode === 'list' && (
            <Suspense>
              <ListView onRefresh={() => router.refresh()} />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  )
}
