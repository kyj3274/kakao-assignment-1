import EventChip from './EventChip'
import {
  WEEKDAY_LABELS,
  buildMonthDays,
  isSameDay,
  toDateKey,
} from '../utils/date'

/*
  MonthView = 월 보기. 6주 x 7일 = 42칸 격자.
  ----------------------------------------------------------------
  - 빈 칸을 클릭하면 그 날짜로 새 일정 추가 모달이 열려요(onCreate).
  - 칸 안 일정 칩을 클릭하면 수정 모달이 열려요(onEditTodo).
*/
function MonthView({ focusDate, todos, onCreate, onEditTodo }) {
  const today = new Date()
  const days = buildMonthDays(focusDate)

  // 특정 날짜 키의 할 일들을 시작 시간 순으로
  const todosOf = (dateKey) =>
    todos
      .filter((todo) => todo.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-[#dadce0]">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-3 py-2 text-right text-[11px] tracking-wide text-[#5f6368]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 격자 */}
      <div className="grid flex-1 auto-rows-fr grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day)
          const isOtherMonth = day.getMonth() !== focusDate.getMonth()
          const isSunday = day.getDay() === 0
          const isToday = isSameDay(day, today)

          // 날짜 숫자 동그라미 색
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
              <div
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs ${dateClass}`}
              >
                {day.getDate()}
              </div>

              {/* 그 날짜의 일정 칩들 */}
              <div className="mt-0.5 flex w-full flex-col gap-0.5 overflow-hidden">
                {todosOf(dateKey).map((todo) => (
                  <EventChip
                    key={todo.id}
                    todo={todo}
                    onClick={() => onEditTodo(todo)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthView
