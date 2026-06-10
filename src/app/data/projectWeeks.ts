import type { WeekOption } from "./weeks";

export const TOTAL_PROJECT_WEEKS = 52;
export const PROJECT_START_MONTH = 0;
export const PROJECT_START_DAY = 15;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function clampProjectWeek(week: number): number {
  return Math.min(TOTAL_PROJECT_WEEKS, Math.max(1, week));
}

export function getProjectStart(year: number): Date {
  return new Date(year, PROJECT_START_MONTH, PROJECT_START_DAY);
}

export function getProjectWeekDates(
  weekNumber: number,
  year: number,
): { start: Date; end: Date } {
  const start = getProjectStart(year);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export function getCurrentProjectWeek(
  referenceDate: Date = new Date(),
  year?: number,
): number {
  const timelineYear = year ?? referenceDate.getFullYear();
  const projectStart = getProjectStart(timelineYear);
  if (referenceDate < projectStart) return 1;
  return clampProjectWeek(
    Math.floor((referenceDate.getTime() - projectStart.getTime()) / MS_PER_WEEK) + 1,
  );
}

/** Full range label used in weekly updates and reports, e.g. Jun 18–Jun 24, 2026 */
export function formatProjectWeekRange(weekNumber: number, year: number): string {
  const { start, end } = getProjectWeekDates(weekNumber, year);
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel}–${endLabel}`;
}

/** Compact range for timeline navigation, e.g. Jun 4–Jun 10 */
export function formatProjectWeekRangeNav(weekNumber: number, year: number): string {
  const { start, end } = getProjectWeekDates(weekNumber, year);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)}–${end.toLocaleDateString("en-US", opts)}`;
}

export function getProjectWeekValue(year: number, weekNumber: number): string {
  return `${year}-PW${String(weekNumber).padStart(2, "0")}`;
}

export function buildProjectWeekOption(weekNumber: number, year: number): WeekOption {
  const { start, end } = getProjectWeekDates(weekNumber, year);
  const rangeLabel = formatProjectWeekRange(weekNumber, year);
  return {
    weekNumber,
    year,
    start,
    end,
    label: `Week ${weekNumber} (${rangeLabel})`,
    value: getProjectWeekValue(year, weekNumber),
  };
}

export function buildProjectWeekOptions(
  referenceDate: Date = new Date(),
  range = 10,
): WeekOption[] {
  const year = referenceDate.getFullYear();
  const currentWeek = getCurrentProjectWeek(referenceDate, year);
  const options: WeekOption[] = [];

  for (let offset = -range; offset <= range; offset += 1) {
    const weekNumber = currentWeek + offset;
    if (weekNumber < 1 || weekNumber > TOTAL_PROJECT_WEEKS) continue;
    options.push(buildProjectWeekOption(weekNumber, year));
  }

  return options.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function buildProjectWeekOptionFromDate(date: Date): WeekOption {
  const year = date.getFullYear();
  const weekNumber = getCurrentProjectWeek(date, year);
  return buildProjectWeekOption(weekNumber, year);
}
