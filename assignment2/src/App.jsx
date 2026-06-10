import { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MonthView from './components/MonthView'
import TimeGridView from './components/TimeGridView'
import TodoModal from './components/TodoModal'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  addDays,
  buildWeekDays,
  toDateKey,
  dateKeyToDate,
  defaultTimeRange,
} from './utils/date'

/*
  App = 앱 전체의 "본부".
  ----------------------------------------------------------------
  ★ 여기 모여 있는 상태(useState / useLocalStorage) ★
  - todos     : 할 일 목록 (localStorage에 저장 → 새로고침해도 유지)
  - focusDate : 지금 화면이 보고 있는 기준 날짜 (localStorage에 저장 → 새로고침해도 유지)
  - viewMode  : 보기 모드 'month' | 'week' | 'day'
  - filter    : 사이드바 목록 필터 'all' | 'upcoming' | 'inProgress' | 'completed'
  - modal     : 등록/수정 모달 상태 (null이면 닫힌 상태)

  이 값들과, 값을 바꾸는 함수들을 자식 컴포넌트에 props로 내려줘요.
*/
function App() {
  const [todos, setTodos] = useLocalStorage('todos', [])
  // focusDate 는 메모리에선 Date 객체로 다뤄요(기존 코드들이 Date 메서드를 씀).
  // 저장은 "YYYY-MM-DD" 문자열로만 하고, 읽을 때 다시 Date 로 복원해요.
  const [focusDate, setFocusDate] = useState(() => {
    const saved = localStorage.getItem('focusDate')
    return saved ? dateKeyToDate(saved) : new Date()
  })
  // focusDate 가 바뀔 때마다 날짜 키로 저장 → 새로고침해도 보던 주차/날짜가 유지돼요.
  useEffect(() => {
    localStorage.setItem('focusDate', toDateKey(focusDate))
  }, [focusDate])
  const [viewMode, setViewMode] = useState('month')
  const [filter, setFilter] = useState('all')

  // modal === null 이면 닫힘. 열려 있으면 { editingId, draft } 모양.
  // - editingId: 수정 중인 할 일 id (null이면 새로 추가)
  // - draft    : 입력창에 채워질 초기값
  const [modal, setModal] = useState(null)

  /* ---------- CRUD ---------- */

  // [Create] 새 할 일 추가
  const addTodo = (data) => {
    const newTodo = { id: Date.now(), done: false, ...data }
    setTodos([...todos, newTodo])
  }

  // [Update] 내용 수정
  const updateTodo = (id, data) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, ...data } : t)))
  }

  // [Delete] 삭제
  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  // 완료 ↔ 미완료 토글
  const toggleTodo = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  /* ---------- 모달 열기/닫기 ---------- */

  // 새 일정 추가용 모달 — 날짜/시간 기본값을 채워서 열어요.
  const openCreateModal = ({ date, startTime, endTime } = {}) => {
    const targetDate = date || toDateKey(focusDate)
    const isToday = targetDate === toDateKey(new Date())
    const fallback = isToday
      ? defaultTimeRange()
      : { startTime: '09:00', endTime: '10:00' }
    setModal({
      editingId: null,
      draft: {
        title: '',
        date: targetDate,
        startTime: startTime || fallback.startTime,
        endTime: endTime || fallback.endTime,
      },
    })
  }

  // 기존 일정 수정용 모달 — 그 일정 내용으로 채워서 열어요.
  const openEditModal = (todo) => {
    setModal({
      editingId: todo.id,
      draft: {
        title: todo.title,
        date: todo.date,
        startTime: todo.startTime,
        endTime: todo.endTime,
      },
    })
  }

  const closeModal = () => setModal(null)

  // 모달 저장: 수정 모드면 update, 아니면 add
  const saveModal = (data) => {
    if (modal.editingId) {
      updateTodo(modal.editingId, data)
    } else {
      addTodo(data)
    }
    closeModal()
  }

  /* ---------- 기간 이동 ---------- */

  // 헤더 화살표: 현재 보기 모드 기준 이전(-1)/다음(+1)
  const movePeriod = (direction) => {
    if (viewMode === 'month') {
      setFocusDate(
        new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1),
      )
    } else if (viewMode === 'week') {
      setFocusDate(addDays(focusDate, 7 * direction))
    } else {
      setFocusDate(addDays(focusDate, direction))
    }
  }

  // 보기 모드 전환 (일 보기로 갈 땐 오늘로 이동)
  const changeView = (mode) => {
    setViewMode(mode)
    if (mode === 'day') setFocusDate(new Date())
  }

  // 날짜 헤더 클릭 → 그 날의 '일' 보기로 이동
  const goToDay = (date) => {
    setFocusDate(date)
    setViewMode('day')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-[#3c4043]">
      <Header
        focusDate={focusDate}
        viewMode={viewMode}
        onPrev={() => movePeriod(-1)}
        onNext={() => movePeriod(1)}
        onChangeView={changeView}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          todos={todos}
          focusDate={focusDate}
          filter={filter}
          onSetFocusDate={setFocusDate}
          onSetFilter={setFilter}
          onCreate={() => openCreateModal()}
          onUpdate={updateTodo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />

        {/* 메인 영역: 보기 모드에 따라 다른 컴포넌트를 그려요 (조건부 렌더링) */}
        <main className="flex min-w-0 flex-1 flex-col">
          {viewMode === 'month' && (
            <MonthView
              focusDate={focusDate}
              todos={todos}
              onCreate={openCreateModal}
              onEditTodo={openEditModal}
            />
          )}
          {viewMode === 'week' && (
            <TimeGridView
              days={buildWeekDays(focusDate)}
              todos={todos}
              onCreate={openCreateModal}
              onEditTodo={openEditModal}
              onDayClick={goToDay}
            />
          )}
          {viewMode === 'day' && (
            <TimeGridView
              days={[new Date(focusDate)]}
              todos={todos}
              onCreate={openCreateModal}
              onEditTodo={openEditModal}
              onDayClick={goToDay}
            />
          )}
        </main>
      </div>

      {/* 모달은 열려 있을 때(modal !== null)만 렌더링 */}
      {modal && (
        <TodoModal
          editingId={modal.editingId}
          initialDraft={modal.draft}
          onSave={saveModal}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default App
