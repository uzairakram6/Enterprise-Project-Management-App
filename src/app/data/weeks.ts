import {
  addWeeks,
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
} from "date-fns";

export interface WeekOption {
  weekNumber: number;
  year: number;
  start: Date;
  end: Date;
  label: string;
  value: string;
}

export function buildWeekOption(date: Date): WeekOption {
  const weekNumber = getISOWeek(date);
  const year = getISOWeekYear(date);
  const start = startOfISOWeek(date);
  const end = endOfISOWeek(date);

  return {
    weekNumber,
    year,
    start,
    end,
    label: `Week ${weekNumber} (${format(start, "MMM d")}–${format(end, "MMM d, yyyy")})`,
    value: `${year}-W${String(weekNumber).padStart(2, "0")}`,
  };
}

export function buildWeekOptions(referenceDate: Date = new Date(), range = 10): WeekOption[] {
  const seen = new Set<string>();
  const options: WeekOption[] = [];

  for (let offset = -range; offset <= range; offset += 1) {
    const option = buildWeekOption(addWeeks(referenceDate, offset));
    if (seen.has(option.value)) continue;
    seen.add(option.value);
    options.push(option);
  }

  return options.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function findWeekOption(value: string, options: WeekOption[]): WeekOption | undefined {
  return options.find((option) => option.value === value);
}
