import {
  formatMonthLabel,
  formatWeekLabel,
  formatDayLabel,
  buildWeekDays,
} from '../utils/date'

/*
  Header = 상단 바.
  ----------------------------------------------------------------
  - 왼쪽: 로고 / 이전·다음 화살표 / 현재 기간 라벨
  - 오른쪽: 보기 전환(월·주·일)
  자기 상태는 없고, App이 내려준 값/함수만 써요.
*/
function Header({ focusDate, viewMode, onPrev, onNext, onChangeView }) {
  // 보기 모드에 따라 가운데 라벨 문구가 달라져요.
  let periodLabel
  if (viewMode === 'month') periodLabel = formatMonthLabel(focusDate)
  else if (viewMode === 'week') periodLabel = formatWeekLabel(buildWeekDays(focusDate))
  else periodLabel = formatDayLabel(focusDate)

  const views = [
    { key: 'month', label: '월' },
    { key: 'week', label: '주' },
    { key: 'day', label: '일' },
  ]

  // 동그란 아이콘 버튼 공통 스타일
  const iconBtn =
    'flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#5f6368] transition hover:bg-[#f1f3f4]'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dadce0] bg-[#f8f9fa] px-4">
      {/* 왼쪽 */}
      <div className="flex items-center gap-2">
        <div className="mr-2 ml-1 flex items-center gap-2">
          <span className="text-[22px]">📅</span>
          <span className="text-[22px] font-normal text-[#5f6368]">Todo</span>
        </div>

        <div className="flex">
          <button className={iconBtn} aria-label="이전" onClick={onPrev}>
            ‹
          </button>
          <button className={iconBtn} aria-label="다음" onClick={onNext}>
            ›
          </button>
        </div>

        <h1 className="ml-2 text-[22px] font-normal whitespace-nowrap text-[#3c4043]">
          {periodLabel}
        </h1>
      </div>

      {/* 오른쪽: 보기 전환 */}
      <div className="flex overflow-hidden rounded-lg border border-[#dadce0]">
        {views.map((view) => (
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

export default Header
