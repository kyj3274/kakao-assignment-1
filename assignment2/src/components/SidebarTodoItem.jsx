import { useState } from 'react'
import {
  getTodoStatus,
  STATUS_LABELS,
  STATUS_STYLES,
} from '../utils/todo'
import { formatListDate } from '../utils/date'

/*
  SidebarTodoItem = 사이드바 일정 목록의 "한 줄".
  ----------------------------------------------------------------
  ★ 여기 있는 useState ★
  - isEditing : 이 항목이 지금 인라인 수정 중인지 (true/false)
  - draft     : 수정 중일 때 입력창들의 임시 값 (제목/날짜/시작/종료)

  ★ isEditing 이 바뀌면? ★
  - false → "보기 모드" : 배지 + 제목 + 날짜줄 + 시간줄 + [수정][완료][삭제]
  - true  → "수정 모드" : 그 자리에 입력창들이 펼쳐지고 [저장][취소]
  모달을 띄우지 않고, 목록 안에서 바로 고쳐요.
*/
function SidebarTodoItem({ todo, onUpdate, onToggle, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo)

  const status = getTodoStatus(todo)
  const style = STATUS_STYLES[status]

  // "수정" → 현재 값으로 입력창을 채우고 수정 모드로
  const startEdit = () => {
    setDraft(todo)
    setIsEditing(true)
  }

  // 입력창 하나가 바뀌면 draft의 해당 칸만 갱신
  const change = (field, value) => setDraft({ ...draft, [field]: value })

  // "저장" → 제목이 비어 있지 않으면 App의 updateTodo 호출
  const saveEdit = () => {
    const title = draft.title.trim()
    if (!title) return
    onUpdate(todo.id, {
      title,
      date: draft.date,
      startTime: draft.startTime || '09:00',
      endTime: draft.endTime || '10:00',
    })
    setIsEditing(false)
  }

  // 버튼 공통 뼈대(색 제외) + 색은 버튼마다 따로 붙여요.
  // (색을 공통에 넣으면 덧붙인 색과 충돌해 안 보이는 문제가 생겨요)
  const btnBase =
    'shrink-0 whitespace-nowrap rounded-md border px-2 py-[3px] text-[11px] transition'
  const btnNeutral =
    'border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f1f3f4]'
  const btnPrimary =
    'border-[#1a73e8] bg-[#1a73e8] text-white hover:bg-[#1665d8]'
  const btnDanger =
    'border-[#dadce0] bg-white text-[#5f6368] hover:border-red-200 hover:bg-red-50 hover:text-red-600'

  // ── 수정 모드 ──────────────────────────────
  if (isEditing) {
    const editInput =
      'h-8 rounded-md border border-[#1a73e8] px-2 text-[12px] text-[#3c4043] outline-none'
    return (
      <li className="flex flex-col gap-1.5 rounded-lg border border-[#dadce0] border-l-[3px] border-l-[#1a73e8] bg-white p-2.5">
        <input
          type="text"
          className={editInput}
          value={draft.title}
          autoFocus
          placeholder="제목"
          onChange={(e) => change('title', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveEdit()
            if (e.key === 'Escape') setIsEditing(false)
          }}
        />
        <input
          type="date"
          className={editInput}
          value={draft.date}
          onChange={(e) => change('date', e.target.value)}
        />
        <div className="flex gap-1.5">
          <input
            type="time"
            className={`${editInput} w-0 min-w-0 flex-1`}
            value={draft.startTime}
            onChange={(e) => change('startTime', e.target.value)}
          />
          <input
            type="time"
            className={`${editInput} w-0 min-w-0 flex-1`}
            value={draft.endTime}
            onChange={(e) => change('endTime', e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-1.5">
          <button className={`${btnBase} ${btnPrimary}`} onClick={saveEdit}>
            저장
          </button>
          <button
            className={`${btnBase} ${btnNeutral}`}
            onClick={() => setIsEditing(false)}
          >
            취소
          </button>
        </div>
      </li>
    )
  }

  // ── 보기 모드 ──────────────────────────────
  return (
    <li
      className={`flex items-start gap-2 rounded-lg border border-[#dadce0] border-l-[3px] bg-white px-2.5 py-2 ${style.bar} ${
        todo.done ? 'opacity-60' : ''
      }`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#1a73e8]"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`self-start rounded-full px-2 py-px text-[10px] font-semibold ${style.badge}`}
        >
          {STATUS_LABELS[status]}
        </span>
        <span
          className={`text-[13px] break-words text-[#3c4043] ${
            todo.done ? 'line-through' : ''
          }`}
        >
          {todo.title}
        </span>
        {/* 날짜 줄 / 시간 줄을 따로 표시 */}
        <span className="text-[11px] text-[#5f6368]">
          {formatListDate(todo.date)}
        </span>
        <span className="text-[11px] text-[#5f6368]">
          {todo.startTime}–{todo.endTime}
        </span>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <button className={`${btnBase} ${btnNeutral}`} onClick={startEdit}>
          수정
        </button>
        <button
          className={`${btnBase} ${btnNeutral}`}
          onClick={() => onToggle(todo.id)}
        >
          {todo.done ? '완료취소' : '완료'}
        </button>
        <button
          className={`${btnBase} ${btnDanger}`}
          onClick={() => onDelete(todo.id)}
        >
          삭제
        </button>
      </div>
    </li>
  )
}

export default SidebarTodoItem
