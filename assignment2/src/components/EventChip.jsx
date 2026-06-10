/*
  EventChip = 달력 칸 위에 얹히는 작은 일정 표시.
  ----------------------------------------------------------------
  - 클릭하면 수정 모달이 열려요(onClick).
  - 단, 칸 클릭(=새 일정 추가)으로 이벤트가 번지지 않도록 stopPropagation 해요.
  - 완료된 일정은 흐리게 + 취소선.
*/
function EventChip({ todo, onClick }) {
  return (
    <div
      title={`${todo.title} (${todo.startTime}–${todo.endTime})`}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={`flex cursor-pointer items-center gap-1 overflow-hidden rounded bg-[#1a73e8] px-1.5 py-0.5 text-[11px] whitespace-nowrap text-white ${
        todo.done ? 'line-through opacity-50' : ''
      }`}
    >
      <span className="shrink-0 font-medium opacity-90">{todo.startTime}</span>
      <span className="overflow-hidden text-ellipsis">{todo.title}</span>
    </div>
  )
}

export default EventChip
