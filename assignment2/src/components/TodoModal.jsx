import { useEffect, useState } from 'react'

/*
  TodoModal = 일정 등록/수정 모달.
  ----------------------------------------------------------------
  ★ 여기 있는 useState ★
  - draft : 입력창 4개(제목/날짜/시작/종료)의 현재 값을 객체로 묶어 관리
  - error : 검증 실패 시 보여줄 안내 메시지

  - editingId가 있으면 "일정 수정", 없으면 "일정 추가" 모드예요.
  - 저장 시 제목/날짜가 비어 있으면 안내 메시지를 보여주고 막아요.
*/
function TodoModal({ editingId, initialDraft, onSave, onClose }) {
  const [draft, setDraft] = useState(initialDraft)
  const [error, setError] = useState('')

  // Esc 키로 닫기 (창 전체에 키 이벤트를 걸고, 사라질 때 정리)
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 입력창 하나가 바뀌면 draft의 해당 칸만 갱신 (나머지는 그대로 복사)
  const change = (field, value) => setDraft({ ...draft, [field]: value })

  const handleSave = () => {
    const title = draft.title.trim()
    if (!title) {
      setError('제목을 입력해 주세요.')
      return
    }
    if (!draft.date) {
      setError('날짜를 선택해 주세요.')
      return
    }
    onSave({
      title,
      date: draft.date,
      startTime: draft.startTime || '09:00',
      endTime: draft.endTime || '10:00',
    })
  }

  const inputClass =
    'h-[38px] rounded-lg border border-[#dadce0] px-2.5 text-sm text-[#3c4043] outline-none focus:border-[#1a73e8]'

  return (
    // 어두운 배경. 배경(자기 자신)을 클릭하면 닫혀요.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex w-90 max-w-[calc(100%-32px)] flex-col gap-3.5 rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-medium text-[#3c4043]">
          {editingId ? '일정 수정' : '일정 추가'}
        </h2>

        {/* 제목 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#5f6368]">제목</span>
          <input
            type="text"
            className={inputClass}
            placeholder="할 일을 입력하세요"
            value={draft.title}
            autoFocus
            onChange={(e) => change('title', e.target.value)}
            // Enter 로 저장 (한글 조합 중 Enter는 무시해 중복 저장 방지)
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSave()
            }}
          />
        </label>

        {/* 날짜 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#5f6368]">날짜</span>
          <input
            type="date"
            className={inputClass}
            value={draft.date}
            onChange={(e) => change('date', e.target.value)}
          />
        </label>

        {/* 시작 / 종료 */}
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-[#5f6368]">시작</span>
            <input
              type="time"
              className={inputClass}
              value={draft.startTime}
              onChange={(e) => change('startTime', e.target.value)}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-[#5f6368]">종료</span>
            <input
              type="time"
              className={inputClass}
              value={draft.endTime}
              onChange={(e) => change('endTime', e.target.value)}
            />
          </label>
        </div>

        {/* 검증 실패 안내 */}
        {error && <p className="text-[13px] text-[#d93025]">{error}</p>}

        {/* 버튼 */}
        <div className="mt-1 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-[38px] rounded-lg border border-[#dadce0] px-4.5 text-sm text-[#5f6368] transition hover:bg-[#f1f3f4]"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="h-[38px] rounded-lg bg-[#1a73e8] px-4.5 text-sm text-white transition hover:bg-[#1665d8]"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default TodoModal
