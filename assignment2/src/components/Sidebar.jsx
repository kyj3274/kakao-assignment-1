import MiniCalendar from './MiniCalendar'
import TodoPanel from './TodoPanel'

/*
  Sidebar = 좌측 사이드바.
  ----------------------------------------------------------------
  '만들기' 버튼 + 미니 달력 + 일정 목록을 위아래로 쌓아요.
  자기 상태는 없고, 받은 props를 그대로 자식들에게 넘겨줘요. (조립 담당)
*/
function Sidebar({
  todos,
  focusDate,
  filter,
  onSetFocusDate,
  onSetFilter,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
}) {
  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-r border-[#dadce0] p-4">
      {/* 만들기 버튼 */}
      <button
        onClick={onCreate}
        className="flex h-12 items-center gap-2.5 rounded-3xl border border-[#dadce0] bg-white pr-5 pl-4 text-sm text-[#3c4043] shadow-sm transition hover:bg-[#f1f3f4] hover:shadow"
      >
        <span className="text-[22px] leading-none text-[#1a73e8]">＋</span>
        <span>만들기</span>
      </button>

      <MiniCalendar focusDate={focusDate} onSelectDate={onSetFocusDate} />

      <TodoPanel
        todos={todos}
        filter={filter}
        onSetFilter={onSetFilter}
        onUpdate={onUpdate}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </aside>
  )
}

export default Sidebar
