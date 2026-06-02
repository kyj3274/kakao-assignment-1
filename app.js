/* =========================================================
   Todo Calendar - 스크립트 (UI 표시 전용)
   ---------------------------------------------------------
   보기 모드(월/주/일)에 따라 메인 영역을 다르게 그린다.
   - 월(month): 6주 x 7일 날짜 격자
   - 주(week) : 7일 x 24시간 타임그리드
   - 일(day)  : 1일 x 24시간 타임그리드
   (할 일 추가/저장 등 실제 Todo 기능은 다음 단계에서 추가 예정)
   ========================================================= */

/* ---------- 상수 ---------- */
// 요일 표기 (일요일 시작 — 한국식 구글 캘린더와 동일)
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
// 타임그리드에서 사용할 0~23시 배열
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/* ---------- 상태 ---------- */
// 현재 화면의 기준이 되는 "포커스 날짜" (월/주/일 모두 이 날짜를 기준으로 계산)
let focusDate = new Date();
// 현재 보기 모드: "month" | "week" | "day"
let viewMode = "month";

/* ---------- DOM 참조 ---------- */
const periodLabel = document.getElementById("periodLabel");
const calendarView = document.getElementById("calendarView");
const viewSwitch = document.getElementById("viewSwitch");

const miniPeriodLabel = document.getElementById("miniPeriodLabel");
const miniWeekdays = document.getElementById("miniWeekdays");
const miniDays = document.getElementById("miniDays");

/* =========================================================
   날짜 유틸 함수
   ========================================================= */

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

    // 날짜 칸을 클릭하면 그 날짜의 '일' 보기로 전환
    cell.addEventListener("click", () => openDayView(day));

    const dateNumber = document.createElement("div");
    dateNumber.className = "cell-date";
    dateNumber.textContent = day.getDate();
    cell.appendChild(dateNumber);

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

    dayHead.append(weekday, dateNumber);
    head.appendChild(dayHead);
  });

  /* --- 본문 (스크롤되는 24시간 영역) --- */
  const scroll = document.createElement("div");
  scroll.className = "timegrid-scroll";

  const content = document.createElement("div");
  content.className = "timegrid-content";

  // 시간(행) -> 시간 라벨 1칸 + 날짜 칸 N개 순서로 채운다
  HOURS.forEach((hour) => {
    const hourLabel = createElementWithClass("div", "tg-hour");
    hourLabel.textContent = formatHourLabel(hour);
    content.appendChild(hourLabel);

    days.forEach(() => {
      content.appendChild(createElementWithClass("div", "tg-cell"));
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

    // 미니 달력 날짜 클릭 -> 그 날짜로 포커스 이동
    dayCell.addEventListener("click", () => {
      focusDate = day;
      renderAll();
    });

    miniDays.appendChild(dayCell);
  });
}

/* =========================================================
   전체 렌더 / 보기 전환
   ========================================================= */

// 현재 상태(보기 모드 + 포커스 날짜)에 맞춰 화면 전체를 다시 그린다
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

  // 3) 사이드바 미니 캘린더 갱신
  renderMiniCalendar();
}

// 특정 날짜를 '일' 보기로 연다 (월 보기에서 날짜 클릭 시 사용)
function openDayView(day) {
  focusDate = new Date(day);
  viewMode = "day";
  renderAll();
}

/* =========================================================
   이동 동작 (이전/다음/오늘)
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

// 오늘로 이동
function goToToday() {
  focusDate = new Date();
  renderAll();
}

/* =========================================================
   이벤트 연결
   ========================================================= */
// 헤더 월 이동 화살표
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
// 오늘 버튼
document.getElementById("todayButton").addEventListener("click", goToToday);

// 보기 전환 버튼 (월/주/일)
viewSwitch.querySelectorAll(".view-button").forEach((button) => {
  button.addEventListener("click", () => {
    viewMode = button.dataset.view;
    renderAll();
  });
});

/* =========================================================
   초기 실행
   ========================================================= */
renderMiniWeekdayHeader(); // 미니 달력 요일 헤더는 한 번만 그리면 됨
renderAll();               // 첫 화면 렌더
