import { Fragment, useEffect, useRef } from 'react'
import EventChip from './EventChip'
import {
  HOURS,
  WEEKDAY_LABELS,
  formatHourLabel,
  isSameDay,
  pad,
  toDateKey,
} from '../utils/date'

/*
  TimeGridView = 주 보기 / 일 보기 공용 타임그리드.
  ----------------------------------------------------------------
  - days 길이가 7이면 주 보기, 1이면 일 보기예요.
  - 가로: [시간 라벨 칸] + [날짜 칸들], 세로: 0~23시.
  - 시간 칸을 클릭하면 그 시간으로 새 일정 모달이 열려요.

  ★ useRef + useEffect ★
  - 처음 열렸을 때 오전 8시쯤이 보이도록 스크롤 위치를 조정하려고
    스크롤 영역에 ref를 걸고, 마운트 직후 scrollTop을 조정해요.
*/
function TimeGridView({ days, todos, onCreate, onEditTodo, onDayClick }) {
  const today = new Date()
  const scrollRef = useRef(null)

  // 처음 그려진 뒤 한 번만 실행 ([] = 마운트 시 1회). 한 칸 48px 기준 오전 8시로.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * 48
  }, [])

  const todosOf = (dateKey) =>
    todos
      .filter((todo) => todo.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // 날짜 칸 개수에 맞춰 grid 열 구성을 만들어요 (시간칸 56px + 날짜칸들)
  const gridCols = { gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 상단 날짜 헤더 */}
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
              <span
                className={`text-[11px] ${isToday ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}
              >
                {WEEKDAY_LABELS[day.getDay()]}
              </span>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[22px] ${
                  isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'
                }`}
              >
                {day.getDate()}
              </span>
              <span
                className={`min-h-3.5 text-[11px] ${isToday ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}
              >
                {count > 0 ? `${count}개` : ''}
              </span>
            </button>
          )
        })}
      </div>

      {/* 본문: 세로 스크롤되는 24시간 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="grid" style={gridCols}>
          {HOURS.map((hour) => (
            // React.Fragment 로 "시간 라벨 1칸 + 날짜 칸 N개"를 한 행처럼 묶어요
            <Fragment key={hour}>
              <div className="h-12 -translate-y-1.5 pr-2 text-right text-[10px] text-[#5f6368]">
                {formatHourLabel(hour)}
              </div>

              {days.map((day) => {
                const dateKey = toDateKey(day)
                const startTime = `${pad(hour)}:00`
                const endTime = hour < 23 ? `${pad(hour + 1)}:00` : '23:59'
                // 이 칸(=이 날짜의 이 시각)에 시작하는 일정들
                const cellTodos = todosOf(dateKey).filter(
                  (todo) => parseInt(todo.startTime.split(':')[0], 10) === hour,
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

export default TimeGridView
