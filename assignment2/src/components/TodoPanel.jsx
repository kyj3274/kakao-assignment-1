import SidebarTodoItem from './SidebarTodoItem'
import { matchesFilter, EMPTY_MESSAGES } from '../utils/todo'

/*
  TodoPanel = 사이드바의 "일정 목록" 영역.
  ----------------------------------------------------------------
  - 상단 필터 버튼(전체/예정/진행중/완료)으로 목록을 걸러요.
  - 각 항목 렌더링과 인라인 수정은 SidebarTodoItem이 맡아요.
*/

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'upcoming', label: '예정' },
  { key: 'inProgress', label: '진행중' },
  { key: 'completed', label: '완료' },
]

function TodoPanel({ todos, filter, onSetFilter, onUpdate, onToggle, onDelete }) {
  // 현재 필터를 통과한 항목만 골라, 날짜 → 시작시간 순으로 정렬
  const visible = todos
    .filter((todo) => matchesFilter(todo, filter))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.startTime.localeCompare(b.startTime)
    })

  return (
    <section className="mt-7">
      <h2 className="mb-3 text-sm font-medium text-[#3c4043]">일정 목록</h2>

      {/* 필터 버튼 */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onSetFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === f.key
                ? 'border-[#e8f0fe] bg-[#e8f0fe] text-[#1a73e8]'
                : 'border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f1f3f4]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 목록 (없으면 안내 문구) */}
      {visible.length === 0 ? (
        <p className="py-2 text-[13px] text-[#5f6368]">
          {EMPTY_MESSAGES[filter]}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((todo) => (
            <SidebarTodoItem
              key={todo.id}
              todo={todo}
              onUpdate={onUpdate}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default TodoPanel
