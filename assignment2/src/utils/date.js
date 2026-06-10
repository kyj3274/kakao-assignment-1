/*
  날짜/시간 계산을 모아둔 유틸 파일.
  ----------------------------------------------------------------
  컴포넌트는 "화면 그리기"에 집중하고,
  날짜 계산 같은 순수 로직은 여기로 빼두면 코드가 깔끔해져요.
  (React와 무관한 그냥 JavaScript 함수들이에요.)
*/

// 요일 표기 (일요일 시작 — 한국식 구글 캘린더와 동일)
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// 타임그리드에서 쓸 0~23시 배열
export const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

// 한 자리 숫자를 "09"처럼 두 자리로 맞춤
export function pad(num) {
  return String(num).padStart(2, '0')
}

// 해당 날짜가 속한 달의 1일
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// 해당 날짜가 속한 주의 일요일
export function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() - result.getDay())
  return result
}

// 기준 날짜에 days일을 더한 새 날짜
export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// 두 날짜가 같은 '하루'인지 (연·월·일 일치)
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Date → "YYYY-MM-DD" (할 일 저장/조회의 날짜 키)
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "YYYY-MM-DD" → Date
export function dateKeyToDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// 새 일정 기본 시간: 현재 시각 정시 ~ 1시간 뒤
export function defaultTimeRange() {
  const startHour = new Date().getHours()
  const startTime = `${pad(startHour)}:00`
  const endTime = startHour < 23 ? `${pad(startHour + 1)}:00` : '23:59'
  return { startTime, endTime }
}

/* ---------- 라벨 문자열 만들기 ---------- */

// "2026년 6월" (월 보기 헤더)
export function formatMonthLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

// "2026년 6월 1일 – 7일" (주 보기 헤더)
export function formatWeekLabel(weekDays) {
  const start = weekDays[0]
  const end = weekDays[6]
  if (start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`
  }
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`
}

// "2026년 6월 2일 (월)" (일 보기 헤더)
export function formatDayLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`
}

// 0~23시를 "오전 9시" / "오후 2시" 로
export function formatHourLabel(hour) {
  const period = hour < 12 ? '오전' : '오후'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${period} ${hour12}시`
}

// "YYYY-MM-DD" → "6월 2일 (월)" (사이드바 목록용)
export function formatListDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return `${month}월 ${day}일 (${WEEKDAY_LABELS[date.getDay()]})`
}

/* ---------- 격자 날짜 묶음 ---------- */

// 월 보기: 1일이 속한 주의 일요일부터 42칸(6주)
export function buildMonthDays(baseDate) {
  const gridStart = startOfWeek(startOfMonth(baseDate))
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

// 주 보기: 포커스 날짜가 속한 주의 7일
export function buildWeekDays(baseDate) {
  const weekStart = startOfWeek(baseDate)
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}
