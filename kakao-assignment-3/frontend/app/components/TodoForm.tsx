'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModalDraft } from '@/types'
import { createTodo, updateTodo, deleteTodo } from '@/app/actions'

type Props = {
  editingId?: number
  initialDraft: ModalDraft
}

export default function TodoForm({ editingId, initialDraft }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<ModalDraft>(initialDraft)
  const [error, setError] = useState('')

  const change = (field: keyof ModalDraft, value: string) =>
    setDraft({ ...draft, [field]: value })

  const handleSave = async () => {
    const title = draft.title.trim()
    if (!title) { setError('제목을 입력해 주세요.'); return }
    if (!draft.date) { setError('날짜를 선택해 주세요.'); return }

    const data = {
      title,
      date: draft.date,
      startTime: draft.startTime || '09:00',
      endTime: draft.endTime || '10:00',
    }

    if (editingId) {
      await updateTodo(editingId, data)
    } else {
      await createTodo(data)
    }
    router.push('/todos')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!editingId) return
    await deleteTodo(editingId)
    router.push('/todos')
    router.refresh()
  }

  const inputClass =
    'h-[38px] w-full rounded-lg border border-[#dadce0] px-2.5 text-sm text-[#3c4043] outline-none focus:border-[#1a73e8]'

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#f8f9fa] pt-16 px-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-8 shadow-sm border border-[#dadce0]">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition text-xl"
          >
            ←
          </button>
          <h1 className="text-lg font-medium text-[#3c4043]">
            {editingId ? '일정 수정' : '일정 추가'}
          </h1>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#5f6368]">제목</span>
          <input
            type="text"
            className={inputClass}
            placeholder="할 일을 입력하세요"
            value={draft.title}
            autoFocus
            onChange={(e) => change('title', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSave() }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#5f6368]">날짜</span>
          <input
            type="date"
            className={inputClass}
            value={draft.date}
            onChange={(e) => change('date', e.target.value)}
          />
        </label>

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

        {error && <p className="text-[13px] text-[#d93025]">{error}</p>}

        <div className="mt-2 flex justify-between gap-2">
          {editingId && (
            <button
              onClick={handleDelete}
              className="h-[38px] rounded-lg border border-[#dadce0] px-4 text-sm text-[#d93025] transition hover:bg-red-50"
            >
              삭제
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => router.back()}
              className="h-[38px] rounded-lg border border-[#dadce0] px-4 text-sm text-[#5f6368] transition hover:bg-[#f1f3f4]"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="h-[38px] rounded-lg bg-[#1a73e8] px-4 text-sm text-white transition hover:bg-[#1665d8]"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
