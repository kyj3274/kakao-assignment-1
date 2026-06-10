import {
  WEEKDAY_LABELS,
  buildMonthDays,
  formatMonthLabel,
  isSameDay,
} from '../utils/date'

/*
  MiniCalendar = 사이드바의 작은 달력.
  ----------------------------------------------------------------
  - 날짜를 클릭하면 그 날짜로 포커스를 옮겨요(onSelectDate).
  - 화살표는 항상 '달' 단위로 이동.
*/
function MiniCalendar({ focusDate, onSelectDate }) {
  const today = new Date()
  const days = buildMonthDays(focusDate)

  // 한 달 앞/뒤로 이동한 날짜를 만들어 onSelectDate로 넘겨요.
  const moveMonth = (direction) =>
    onSelectDate(
      new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1),
    )

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#3c4043]">
          {formatMonthLabel(focusDate)}
        </span>
        <div className="flex">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-base text-[#5f6368] hover:bg-[#f1f3f4]"
            onClick={() => moveMonth(-1)}
            aria-label="이전 달"
          >
            ‹
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-base text-[#5f6368] hover:bg-[#f1f3f4]"
            onClick={() => moveMonth(1)}
            aria-label="다음 달"
          >
            ›
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[11px] text-[#5f6368]">
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 격자 */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isOtherMonth = day.getMonth() !== focusDate.getMonth()
          const isFocus = isSameDay(day, focusDate)
          const isToday = isSameDay(day, today)

          // 상태에 따라 동그라미 색을 바꿔요 (오늘 > 선택 > 기본 순서)
          let circle = 'hover:bg-[#f1f3f4] text-[#3c4043]'
          if (isOtherMonth) circle = 'text-[#bdc1c6] hover:bg-[#f1f3f4]'
          if (isFocus) circle = 'bg-[#e8f0fe] text-[#1a73e8]'
          if (isToday) circle = 'bg-[#1a73e8] text-white'

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`m-auto flex aspect-square w-7 items-center justify-center rounded-full text-xs transition ${circle}`}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default MiniCalendar
