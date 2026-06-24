export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

export function pad(num: number): string {
  return String(num).padStart(2, '0')
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() - result.getDay())
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function dateKeyToDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function defaultTimeRange(): { startTime: string; endTime: string } {
  const startHour = new Date().getHours()
  const startTime = `${pad(startHour)}:00`
  const endTime = startHour < 23 ? `${pad(startHour + 1)}:00` : '23:59'
  return { startTime, endTime }
}

export function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

export function formatWeekLabel(weekDays: Date[]): string {
  const start = weekDays[0]
  const end = weekDays[6]
  if (start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`
  }
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`
}

export function formatDayLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`
}

export function formatHourLabel(hour: number): string {
  const period = hour < 12 ? '오전' : '오후'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${period} ${hour12}시`
}

export function formatListDate(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Number(dateKey.split('-')[0]), month - 1, day)
  return `${month}월 ${day}일 (${WEEKDAY_LABELS[date.getDay()]})`
}

export function buildMonthDays(baseDate: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(baseDate))
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

export function buildWeekDays(baseDate: Date): Date[] {
  const weekStart = startOfWeek(baseDate)
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}
