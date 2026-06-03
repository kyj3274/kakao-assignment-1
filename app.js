/* =========================================================
   Todo Calendar - 스크립트
   ---------------------------------------------------------
   보기 모드(월/주/일)에 따라 메인 영역을 다르게 그리고,
   일정(Todo)을 모달로 등록 / 수정 / 완료 / 삭제한다.
   - 월(month): 6주 x 7일 날짜 격자 (날짜 클릭 → 등록 모달)
   - 주(week) : 7일 x 24시간 타임그리드 (시간 칸 클릭 → 그 시간으로 등록 모달)
   - 일(day)  : 1일 x 24시간 타임그리드 (시간 칸 클릭 → 그 시간으로 등록 모달)
   등록된 일정은 localStorage에 저장되어 새로고침 후에도 유지된다.
   ========================================================= */

/* ---------- 상수 ---------- */
// 요일 표기 (일요일 시작 — 한국식 구글 캘린더와 동일)
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
// 타임그리드에서 사용할 0~23시 배열
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

// 일정 저장에 사용할 localStorage 키
const STORAGE_KEY = "todo-calendar.todos";
// 보기 상태(보기 모드 + 기준 날짜) 저장에 사용할 localStorage 키
const VIEW_STORAGE_KEY = "todo-calendar.view";
// 보기 모드로 허용되는 값
const VIEW_MODES = ["month", "week", "day"];

/* ---------- 상태 ---------- */
// 저장된 보기 상태(보기 모드 + 기준 날짜)를 복원 (없으면 null)
const savedView = loadViewState();
// 현재 화면의 기준이 되는 "포커스 날짜" (저장돼 있으면 그 날짜로 복원)
let focusDate = savedView ? dateKeyToDate(savedView.focusDate) : new Date();
// 현재 보기 모드: "month" | "week" | "day" (저장돼 있으면 그 모드로 복원)
let viewMode = savedView && VIEW_MODES.includes(savedView.viewMode)
  ? savedView.viewMode
  : "month";
// 등록된 일정 목록 (localStorage에서 복원)
let todos = loadTodos();
// 모달이 현재 '수정'하고 있는 일정 id (null이면 새 일정 추가 모드)
let editingTodoId = null;
// 일정 목록 필터: "all" | "upcoming" | "inProgress" | "completed"
// 기본 "all"은 완료된 일정을 숨기며, 완료는 "completed" 필터를 직접 골랐을 때만 보인다
let todoFilter = "all";

/* ---------- DOM 참조 ---------- */
const periodLabel = document.getElementById("periodLabel");
const calendarView = document.getElementById("calendarView");
const viewSwitch = document.getElementById("viewSwitch");

const miniPeriodLabel = document.getElementById("miniPeriodLabel");
const miniWeekdays = document.getElementById("miniWeekdays");
const miniDays = document.getElementById("miniDays");

const todoListContainer = document.getElementById("todoList");
const todoFilters = document.getElementById("todoFilters");

// 모달 관련 DOM
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const inputTitle = document.getElementById("todoTitle");
const inputDate = document.getElementById("todoDate");
const inputStart = document.getElementById("todoStart");
const inputEnd = document.getElementById("todoEnd");
const modalError = document.getElementById("modalError");

/* =========================================================
   날짜/시간 유틸 함수
   ========================================================= */

// 한 자리 숫자를 "09"처럼 두 자리로 맞춤
function pad(num) {
  return String(num).padStart(2, "0");
}

// 해당 날짜가 속한 달의 1일을 반환
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 해당 날짜가 속한 주의 일요일을 반환
function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - result.getDay());
  return result;
}

// 기준 날짜에 days일을 더한 새 날짜 반환
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 두 날짜가 같은 '하루'인지 비교 (연·월·일 일치)
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Date → "YYYY-MM-DD" 문자열 (일정 저장/조회의 날짜 키로 사용)
function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "YYYY-MM-DD" 문자열 → Date (toDateKey의 역변환)
function dateKeyToDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 새 일정 기본 시간: 현재 시각을 정시로 맞춘 시작 ~ 1시간 뒤 종료
function defaultTimeRange() {
  const startHour = new Date().getHours();
  const startTime = `${pad(startHour)}:00`;
  const endTime = startHour < 23 ? `${pad(startHour + 1)}:00` : "23:59";
  return { startTime, endTime };
}

// "2026년 6월" 형태의 라벨 문자열 생성 (월 보기용)
function formatMonthLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// "2026년 6월 1일 – 7일" 형태의 주 범위 라벨 생성 (주 보기용)
function formatWeekLabel(weekDays) {
  const start = weekDays[0];
  const end = weekDays[6];

  // 같은 달이면 끝 날짜는 '일'만 표기
  if (start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`;
  }
  // 달이 다르면 양쪽 모두 '월 일' 표기
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

// "2026년 6월 2일 (월)" 형태의 라벨 생성 (일 보기용)
function formatDayLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

// 0~23시를 "오전 9시" / "오후 2시" 형태로 변환 (타임그리드 시간 라벨용)
function formatHourLabel(hour) {
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${hour12}시`;
}

// "YYYY-MM-DD" → "6월 2일 (월)" (일정 목록의 날짜 표기용)
function formatListDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${month}월 ${day}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

/* =========================================================
   일정(Todo) 데이터 관리 (CRUD + localStorage)
   ========================================================= */

// localStorage에서 일정 목록 불러오기 (없거나 깨졌으면 빈 배열)
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 현재 일정 목록을 localStorage에 저장
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 저장된 보기 상태 불러오기 (없거나 깨졌으면 null)
function loadViewState() {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    // 날짜 키가 들어 있어야 유효한 상태로 본다
    return parsed && parsed.focusDate ? parsed : null;
  } catch {
    return null;
  }
}

// 현재 보기 상태(보기 모드 + 기준 날짜)를 localStorage에 저장
function saveViewState() {
  localStorage.setItem(
    VIEW_STORAGE_KEY,
    JSON.stringify({ viewMode, focusDate: toDateKey(focusDate) })
  );
}

// 일정마다 부여할 고유 id 생성
function createId() {
  return `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// 새 일정 추가
function addTodo(data) {
  todos.push({ id: createId(), done: false, ...data });
  saveTodos();
}

// 기존 일정 내용 수정 (id로 찾아 덮어쓰기)
function updateTodo(id, data) {
  todos = todos.map((todo) => (todo.id === id ? { ...todo, ...data } : todo));
  saveTodos();
}

// 일정 삭제
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
}

// 완료/미완료 상태 토글
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveTodos();
}

// 특정 날짜(키)에 해당하는 일정들을 시작 시간 순으로 반환
function getTodosForDateKey(dateKey) {
  return todos
    .filter((todo) => todo.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// 현재 시각 기준으로 일정의 상태를 판정
// - "completed"  : 완료 처리된 일정
// - "upcoming"   : 아직 시작 전 (예정)
// - "inProgress" : 시작~종료 사이 (진행중)
// - "overdue"    : 종료 시각이 지났는데 완료 안 됨 (지난 일정)
function getTodoStatus(todo, now = new Date()) {
  if (todo.done) return "completed";
  const start = new Date(`${todo.date}T${todo.startTime}`);
  const end = new Date(`${todo.date}T${todo.endTime}`);
  if (now < start) return "upcoming";
  if (now > end) return "overdue";
  return "inProgress";
}

// 현재 선택된 필터(todoFilter)에 일정이 포함되는지 판단
// - "all"  : 완료를 제외한 모든 일정(예정·진행중·지난 일정)
// - 그 외  : 해당 상태와 정확히 일치하는 일정만
function matchesTodoFilter(todo) {
  const status = getTodoStatus(todo);
  if (todoFilter === "all") return status !== "completed";
  return status === todoFilter;
}

/* =========================================================
   격자/날짜 묶음 계산
   ========================================================= */

// 월 보기용: 1일이 속한 주의 일요일부터 42칸(6주) 날짜 배열 생성
function buildMonthDays(baseDate) {
  const gridStart = startOfWeek(startOfMonth(baseDate));
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

// 주 보기용: 포커스 날짜가 속한 주의 7일 배열 생성
function buildWeekDays(baseDate) {
  const weekStart = startOfWeek(baseDate);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

/* =========================================================
   일정 표시용 칩(이벤트) 만들기
   ========================================================= */

// 캘린더 위에 얹는 일정 칩 생성 (클릭 시 수정 모달 열림)
function buildEventChip(todo) {
  const chip = createElementWithClass("div", "event-chip");
  if (todo.done) chip.classList.add("is-done"); // 완료된 일정은 흐리게 + 취소선

  const time = createElementWithClass("span", "chip-time");
  time.textContent = todo.startTime;
  const text = createElementWithClass("span", "chip-text");
  text.textContent = todo.title;

  chip.append(time, text);
  chip.title = `${todo.title} (${todo.startTime}–${todo.endTime})`;

  // 칩 클릭은 칸 클릭(=새 일정)으로 번지지 않게 막고, 수정 모달을 연다
  chip.addEventListener("click", (event) => {
    event.stopPropagation();
    openModal({ todo });
  });
  return chip;
}

/* =========================================================
   렌더링 - 메인 캘린더
   ========================================================= */

// [월 보기] 6주 x 7일 날짜 격자 그리기
function renderMonthView() {
  const today = new Date();
  const days = buildMonthDays(focusDate);

  // 요일 헤더(일~토)
  const weekdayHeader = document.createElement("div");
  weekdayHeader.className = "calendar-weekdays";
  WEEKDAY_LABELS.forEach((label) => {
    const cell = document.createElement("div");
    cell.className = "calendar-weekday";
    cell.textContent = label;
    weekdayHeader.appendChild(cell);
  });

  // 날짜 격자
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  days.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    if (day.getMonth() !== focusDate.getMonth()) cell.classList.add("is-other-month");
    if (day.getDay() === 0) cell.classList.add("is-sunday");
    if (isSameDay(day, today)) cell.classList.add("is-today");

    // 날짜 칸을 클릭하면 그 날짜로 일정 등록 모달을 연다 (시간은 현재 시각 기준 기본값)
    cell.addEventListener("click", () => openModal({ date: toDateKey(day) }));

    const dateNumber = document.createElement("div");
    dateNumber.className = "cell-date";
    dateNumber.textContent = day.getDate();
    cell.appendChild(dateNumber);

    // 그 날짜의 일정들을 칩으로 얹기
    const events = createElementWithClass("div", "cell-events");
    getTodosForDateKey(toDateKey(day)).forEach((todo) => {
      events.appendChild(buildEventChip(todo));
    });
    cell.appendChild(events);

    grid.appendChild(cell);
  });

  calendarView.replaceChildren(weekdayHeader, grid);
}

// [주/일 보기 공용] 주어진 날짜들(days)로 24시간 타임그리드 그리기
function renderTimeGridView(days) {
  const today = new Date();

  const timegrid = document.createElement("div");
  timegrid.className = "timegrid";
  // 날짜 칸 개수를 CSS 변수로 전달 (주=7, 일=1)
  timegrid.style.setProperty("--day-count", days.length);

  /* --- 상단 날짜 헤더 (요일 + 날짜) --- */
  const head = document.createElement("div");
  head.className = "timegrid-head";
  // 시간 칸 위쪽의 빈 모서리
  head.appendChild(createElementWithClass("div", "timegrid-corner"));

  days.forEach((day) => {
    const dayHead = document.createElement("div");
    dayHead.className = "tg-dayhead";
    if (isSameDay(day, today)) dayHead.classList.add("is-today");

    const weekday = createElementWithClass("span", "dh-weekday");
    weekday.textContent = WEEKDAY_LABELS[day.getDay()];

    const dateNumber = createElementWithClass("span", "dh-date");
    dateNumber.textContent = day.getDate();

    // 그 날짜의 할 일 개수 (0개면 표시 안 함)
    const count = getTodosForDateKey(toDateKey(day)).length;
    const countLabel = createElementWithClass("span", "dh-count");
    countLabel.textContent = count > 0 ? `${count}개` : "";

    // 날짜 헤더를 클릭하면 그 날짜의 '일' 보기로 이동
    dayHead.addEventListener("click", () => {
      focusDate = day;
      viewMode = "day";
      renderAll();
    });

    dayHead.append(weekday, dateNumber, countLabel);
    head.appendChild(dayHead);
  });

  /* --- 본문 (스크롤되는 24시간 영역) --- */
  const scroll = document.createElement("div");
  scroll.className = "timegrid-scroll";

  const content = document.createElement("div");
  content.className = "timegrid-content";

  // 일정을 얹을 자리를 찾기 위해 "날짜인덱스:시" → 셀 참조를 저장
  const cellByDayHour = {};

  // 시간(행) -> 시간 라벨 1칸 + 날짜 칸 N개 순서로 채운다
  HOURS.forEach((hour) => {
    const hourLabel = createElementWithClass("div", "tg-hour");
    hourLabel.textContent = formatHourLabel(hour);
    content.appendChild(hourLabel);

    days.forEach((day, dayIndex) => {
      const cell = createElementWithClass("div", "tg-cell");

      // 시간 칸을 클릭하면 그 시간부터 1시간으로 모달을 세팅해 연다
      const startTime = `${pad(hour)}:00`;
      const endTime = hour < 23 ? `${pad(hour + 1)}:00` : "23:59";
      cell.addEventListener("click", () =>
        openModal({ date: toDateKey(day), startTime, endTime })
      );

      cellByDayHour[`${dayIndex}:${hour}`] = cell;
      content.appendChild(cell);
    });
  });

  // 각 날짜의 일정을 '시작 시각' 칸 안에 칩으로 얹는다
  days.forEach((day, dayIndex) => {
    getTodosForDateKey(toDateKey(day)).forEach((todo) => {
      const startHour = parseInt(todo.startTime.split(":")[0], 10);
      const cell = cellByDayHour[`${dayIndex}:${startHour}`];
      if (cell) cell.appendChild(buildEventChip(todo));
    });
  });

  scroll.appendChild(content);
  timegrid.append(head, scroll);
  calendarView.replaceChildren(timegrid);

  // 처음 열 때 오전 8시 부근이 보이도록 스크롤 위치 조정 (한 칸 48px 기준)
  scroll.scrollTop = 8 * 48;
}

// 클래스명을 지정해 요소를 만드는 작은 헬퍼
function createElementWithClass(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

/* =========================================================
   렌더링 - 사이드바 미니 캘린더
   ========================================================= */

// 미니 캘린더 요일 헤더(일~토) 그리기
function renderMiniWeekdayHeader() {
  miniWeekdays.innerHTML = "";
  WEEKDAY_LABELS.forEach((label) => {
    const cell = createElementWithClass("div", "mini-weekday");
    cell.textContent = label;
    miniWeekdays.appendChild(cell);
  });
}

// 미니 캘린더 날짜 격자 그리기 (포커스 날짜의 달 기준)
function renderMiniCalendar() {
  const today = new Date();
  const days = buildMonthDays(focusDate);

  miniPeriodLabel.textContent = formatMonthLabel(focusDate);
  miniDays.innerHTML = "";

  days.forEach((day) => {
    const dayCell = createElementWithClass("div", "mini-day");
    dayCell.textContent = day.getDate();

    if (day.getMonth() !== focusDate.getMonth()) dayCell.classList.add("is-other-month");
    if (isSameDay(day, focusDate)) dayCell.classList.add("is-selected"); // 현재 포커스 날짜
    if (isSameDay(day, today)) dayCell.classList.add("is-today");

    // 미니 달력 날짜 클릭 -> 그 날짜로 포커스 이동 (보기 모드는 유지)
    dayCell.addEventListener("click", () => {
      focusDate = day;
      renderAll();
    });

    miniDays.appendChild(dayCell);
  });
}

/* =========================================================
   렌더링 - 일정 목록 (사이드바)
   ========================================================= */

// 상태별 배지 텍스트와 CSS 클래스 (목록에서 상태를 색으로 구분)
const STATUS_LABELS = {
  upcoming: "예정",
  inProgress: "진행중",
  completed: "완료",
  overdue: "지난",
};
const STATUS_CLASS = {
  upcoming: "is-upcoming",
  inProgress: "is-inprogress",
  completed: "is-completed",
  overdue: "is-overdue",
};

// 작은 동작 버튼 하나를 만드는 헬퍼
function makeTodoButton(label, variant, onClick) {
  const button = createElementWithClass("button", `todo-btn is-${variant}`);
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

// 일정 목록의 한 줄(li) 만들기: 체크박스 + 내용 + 수정/완료/삭제 버튼
function buildTodoListItem(todo) {
  const item = createElementWithClass("li", "todo-item");
  if (todo.done) item.classList.add("is-done");

  // 현재 상태(예정/진행중/완료/지난)에 따른 색상 클래스 부여 (왼쪽 띠 + 배지 색)
  const status = getTodoStatus(todo);
  item.classList.add(STATUS_CLASS[status]);

  // 완료 여부를 보여주고 토글하는 체크박스
  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "todo-check";
  check.checked = todo.done;
  check.addEventListener("change", () => {
    toggleTodo(todo.id);
    renderAll();
  });

  // 상태 배지 + 제목 + 날짜/시간 정보
  const info = createElementWithClass("div", "todo-info");
  const badge = createElementWithClass("span", "todo-status");
  badge.textContent = STATUS_LABELS[status];
  const text = createElementWithClass("span", "todo-text");
  text.textContent = todo.title;
  const meta = createElementWithClass("span", "todo-meta");
  meta.textContent = `${formatListDate(todo.date)} · ${todo.startTime}–${todo.endTime}`;
  info.append(badge, text, meta);

  // 수정 / 완료 / 삭제 버튼
  const buttons = createElementWithClass("div", "todo-buttons");
  const editButton = makeTodoButton("수정", "edit", () => openModal({ todo }));
  const doneButton = makeTodoButton(todo.done ? "완료취소" : "완료", "done", () => {
    toggleTodo(todo.id);
    renderAll();
  });
  const deleteButton = makeTodoButton("삭제", "delete", () => {
    deleteTodo(todo.id);
    renderAll();
  });
  buttons.append(editButton, doneButton, deleteButton);

  item.append(check, info, buttons);
  return item;
}

// 필터별 '일정 없음' 안내 문구
const EMPTY_MESSAGES = {
  all: "등록된 일정이 없습니다.",
  upcoming: "예정된 일정이 없습니다.",
  inProgress: "진행 중인 일정이 없습니다.",
  completed: "완료된 일정이 없습니다.",
};

// 일정 목록 그리기 (현재 필터 적용 → 날짜 → 시작시간 순 정렬)
function renderTodoList() {
  todoListContainer.innerHTML = "";

  const visibleTodos = [...todos]
    .filter(matchesTodoFilter)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

  if (visibleTodos.length === 0) {
    const empty = createElementWithClass("li", "todo-empty");
    empty.textContent = EMPTY_MESSAGES[todoFilter] || "표시할 일정이 없습니다.";
    todoListContainer.appendChild(empty);
    return;
  }

  visibleTodos.forEach((todo) => {
    todoListContainer.appendChild(buildTodoListItem(todo));
  });
}

/* =========================================================
   전체 렌더 / 보기 전환
   ========================================================= */

// 현재 상태(보기 모드 + 포커스 날짜 + 일정)에 맞춰 화면 전체를 다시 그린다
function renderAll() {
  // 1) 메인 영역: 보기 모드에 따라 분기
  if (viewMode === "month") {
    periodLabel.textContent = formatMonthLabel(focusDate);
    renderMonthView();
  } else if (viewMode === "week") {
    const weekDays = buildWeekDays(focusDate);
    periodLabel.textContent = formatWeekLabel(weekDays);
    renderTimeGridView(weekDays);
  } else {
    // day
    periodLabel.textContent = formatDayLabel(focusDate);
    renderTimeGridView([new Date(focusDate)]);
  }

  // 2) 보기 전환 버튼의 활성 상태 갱신
  viewSwitch.querySelectorAll(".view-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewMode);
  });

  // 3) 사이드바 미니 캘린더 + 일정 목록 갱신
  renderMiniCalendar();
  renderTodoList();

  // 4) 현재 보기 상태(보기 모드 + 기준 날짜)를 저장해 새로고침 후에도 유지
  saveViewState();
}

/* =========================================================
   일정 등록/수정 모달
   ========================================================= */

// 모달 열기
// - 새 일정: { date, startTime, endTime }를 넘기면 그 값으로 채워진 빈 폼
// - 수정:   { todo }를 넘기면 해당 일정 내용으로 채워진 폼
function openModal({ date, startTime, endTime, todo } = {}) {
  if (todo) {
    editingTodoId = todo.id;
    modalTitle.textContent = "일정 수정";
    inputTitle.value = todo.title;
    inputDate.value = todo.date;
    inputStart.value = todo.startTime;
    inputEnd.value = todo.endTime;
  } else {
    editingTodoId = null;
    modalTitle.textContent = "일정 추가";
    inputTitle.value = "";
    const targetDateKey = date || toDateKey(focusDate);
    // 오늘이면 현재 시각(정시)~1시간 뒤, 그 외 날짜는 09:00~10:00로 고정
    const fallback =
      targetDateKey === toDateKey(new Date())
        ? defaultTimeRange()
        : { startTime: "09:00", endTime: "10:00" };
    inputDate.value = targetDateKey;
    inputStart.value = startTime || fallback.startTime;
    inputEnd.value = endTime || fallback.endTime;
  }

  hideModalError();
  modalOverlay.hidden = false;
  inputTitle.focus();
}

// 모달 닫기
function closeModal() {
  modalOverlay.hidden = true;
  editingTodoId = null;
}

// 안내 메시지 표시/숨김
function showModalError(message) {
  modalError.textContent = message;
  modalError.hidden = false;
}
function hideModalError() {
  modalError.hidden = true;
}

// 모달 저장: 입력값 검증 후 추가/수정
function submitModal() {
  const title = inputTitle.value.trim();

  // 입력값(제목)이 비어 있으면 등록하지 않고 안내 메시지 표시
  if (!title) {
    showModalError("제목을 입력해 주세요.");
    inputTitle.focus();
    return;
  }
  // 날짜가 비어 있어도 등록 불가
  if (!inputDate.value) {
    showModalError("날짜를 선택해 주세요.");
    return;
  }

  const data = {
    title,
    date: inputDate.value,
    startTime: inputStart.value || "09:00",
    endTime: inputEnd.value || "10:00",
  };

  if (editingTodoId) {
    updateTodo(editingTodoId, data); // 수정 모드
  } else {
    addTodo(data); // 추가 모드
  }

  closeModal();
  renderAll();
}

/* =========================================================
   이동 동작 (이전/다음)
   ========================================================= */

// 현재 보기 모드 기준으로 이전(-1)/다음(+1) 기간으로 이동
function movePeriod(direction) {
  if (viewMode === "month") {
    focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1);
  } else if (viewMode === "week") {
    focusDate = addDays(focusDate, 7 * direction);
  } else {
    focusDate = addDays(focusDate, direction);
  }
  renderAll();
}

/* =========================================================
   이벤트 연결
   ========================================================= */
// 헤더 기간 이동 화살표
document.getElementById("prevButton").addEventListener("click", () => movePeriod(-1));
document.getElementById("nextButton").addEventListener("click", () => movePeriod(1));
// 미니 달력 화살표는 항상 '달' 단위로 이동
document.getElementById("miniPrevButton").addEventListener("click", () => {
  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, 1);
  renderAll();
});
document.getElementById("miniNextButton").addEventListener("click", () => {
  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 1);
  renderAll();
});
// 보기 전환 버튼 (월/주/일)
viewSwitch.querySelectorAll(".view-button").forEach((button) => {
  button.addEventListener("click", () => {
    viewMode = button.dataset.view;
    // '일' 보기로 바꿀 때는 오늘 날짜로 이동 (월 보기 이동으로 1일에 머물던 문제 방지)
    if (viewMode === "day") focusDate = new Date();
    renderAll();
  });
});

// 일정 목록 상태 필터 (전체/예정/진행중/완료)
todoFilters.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    todoFilter = button.dataset.filter;
    // 활성 버튼 표시 갱신
    todoFilters.querySelectorAll(".filter-button").forEach((other) => {
      other.classList.toggle("is-active", other.dataset.filter === todoFilter);
    });
    renderTodoList();
  });
});

// '만들기' 버튼: 포커스 날짜 + 현재 시각 기준 기본값으로 모달 열기
document.getElementById("createButton").addEventListener("click", () =>
  openModal({ date: toDateKey(focusDate) })
);

// 모달 버튼: 저장 / 취소
document.getElementById("modalSave").addEventListener("click", submitModal);
document.getElementById("modalCancel").addEventListener("click", closeModal);

// 모달 바깥(어두운 배경) 클릭 시 닫기
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

// 제목 입력 중 Enter → 저장, Esc → 닫기
// (한글 IME 조합 중에 발생하는 Enter는 무시해서 중복 저장을 막는다)
inputTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.isComposing) submitModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalOverlay.hidden) closeModal();
});

/* =========================================================
   초기 실행
   ========================================================= */
renderMiniWeekdayHeader(); // 미니 달력 요일 헤더는 한 번만 그리면 됨
renderAll();               // 첫 화면 렌더
