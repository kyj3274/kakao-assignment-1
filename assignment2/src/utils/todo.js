/*
  할 일(todo)의 "상태"와 관련된 순수 로직.
  ----------------------------------------------------------------
  하나의 할 일은 이런 모양이에요:
    { id, title, date: "YYYY-MM-DD", startTime: "HH:MM", endTime: "HH:MM", done }
*/

// 현재 시각 기준으로 할 일의 상태를 판정
// - "completed"  : 완료됨
// - "upcoming"   : 아직 시작 전 (예정)
// - "inProgress" : 시작~종료 사이 (진행중)
// - "overdue"    : 종료 시각이 지났는데 완료 안 됨 (지난 일정)
export function getTodoStatus(todo, now = new Date()) {
  if (todo.done) return 'completed'
  const start = new Date(`${todo.date}T${todo.startTime}`)
  const end = new Date(`${todo.date}T${todo.endTime}`)
  if (now < start) return 'upcoming'
  if (now > end) return 'overdue'
  return 'inProgress'
}

// 상태 → 한글 라벨 (배지 텍스트)
export const STATUS_LABELS = {
  upcoming: '예정',
  inProgress: '진행중',
  completed: '완료',
  overdue: '지난',
}

// 상태 → Tailwind 색상 클래스 (배지 배경/글자 + 왼쪽 띠)
export const STATUS_STYLES = {
  upcoming: { badge: 'bg-blue-50 text-blue-700', bar: 'border-l-blue-500' },
  inProgress: { badge: 'bg-amber-50 text-amber-700', bar: 'border-l-amber-500' },
  completed: { badge: 'bg-green-50 text-green-700', bar: 'border-l-green-600' },
  overdue: { badge: 'bg-red-50 text-red-700', bar: 'border-l-red-500' },
}

// 필터별 '일정 없음' 안내 문구
export const EMPTY_MESSAGES = {
  all: '등록된 일정이 없습니다.',
  upcoming: '예정된 일정이 없습니다.',
  inProgress: '진행 중인 일정이 없습니다.',
  completed: '완료된 일정이 없습니다.',
}

// 선택한 필터에 이 할 일이 포함되는지
// - "all"  : 완료를 제외한 모든 일정
// - 그 외  : 해당 상태와 정확히 일치
export function matchesFilter(todo, filter) {
  const status = getTodoStatus(todo)
  if (filter === 'all') return status !== 'completed'
  return status === filter
}
