'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Todo } from '@/types'
import { getTodoStatus, STATUS_LABELS, STATUS_STYLES } from '@/utils/todo'
import { formatListDate } from '@/utils/date'
import { toggleTodo, deleteTodo } from '@/app/actions'

type ListFilter = 'all' | 'active' | 'completed'

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'completed', label: '완료' },
]

const EMPTY_MESSAGES: Record<ListFilter, string> = {
  all: '등록된 일정이 없습니다.',
  active: '진행 중인 일정이 없습니다.',
  completed: '완료된 일정이 없습니다.',
}

type Props = {
  onRefresh: () => void
}

export default function ListView({ onRefresh }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filter = (searchParams.get('filter') as ListFilter) ?? 'all'
  const search = searchParams.get('search') ?? ''

  const [inputValue, setInputValue] = useState(search)
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const isFirstRender = useRef(true)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('filter', filter)
      if (search) params.set('search', search)
      const query = params.toString() ? `?${params}` : ''
      const res = await fetch(`/api/todos${query}`)
      if (!res.ok) throw new Error('서버 오류')
      setTodos(await res.json())
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // 검색어 입력 300ms 디바운스 → URL 반영
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (inputValue) {
        params.set('search', inputValue)
      } else {
        params.delete('search')
      }
      router.replace(`${pathname}?${params}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = (f: ListFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    if (f === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', f)
    }
    router.replace(`${pathname}?${params}`)
  }

  const handleToggle = async (id: number) => {
    await toggleTodo(id)
    onRefresh()
    fetchTodos()
  }

  const handleDelete = async (id: number) => {
    await deleteTodo(id)
    onRefresh()
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const visible = [...todos].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
      {/* 검색창 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="일정 제목으로 검색..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full rounded-lg border border-[#dadce0] px-4 py-2 text-sm text-[#3c4043] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
        />
      </div>

      {/* 필터 탭 */}
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === f.key
                ? 'border-[#e8f0fe] bg-[#e8f0fe] text-[#1a73e8]'
                : 'border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f1f3f4]'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-[#5f6368]">
          총 {visible.length}개
        </span>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-[#5f6368]">불러오는 중...</div>
      ) : visible.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[#5f6368]">
          {search ? `"${search}" 검색 결과가 없습니다.` : EMPTY_MESSAGES[filter]}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((todo) => {
            const status = getTodoStatus(todo)
            const style = STATUS_STYLES[status]
            return (
              <li
                key={todo.id}
                className={`flex items-center gap-4 rounded-xl border border-[#dadce0] border-l-4 bg-white px-4 py-3 transition hover:shadow-sm ${style.bar} ${todo.done ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#1a73e8]"
                  checked={todo.done}
                  onChange={() => handleToggle(todo.id)}
                />
                <div
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5"
                  onClick={() => router.push(`/todos/${todo.id}`)}
                >
                  <span className={`text-sm font-medium text-[#3c4043] ${todo.done ? 'line-through' : ''}`}>
                    {todo.title}
                  </span>
                  <span className="text-xs text-[#5f6368]">
                    {formatListDate(todo.date)} · {todo.startTime}–{todo.endTime}
                  </span>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.badge}`}>
                  {STATUS_LABELS[status]}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="shrink-0 rounded-md border border-[#dadce0] px-2.5 py-1 text-xs text-[#5f6368] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  삭제
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
