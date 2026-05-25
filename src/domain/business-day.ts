export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isNonWorkingDay(
  date: Date,
  holidays: Map<string, string>,
  worksOnSaturday: boolean
): boolean {
  const dow = date.getDay();
  if (dow === 0) return true; // domingo
  if (dow === 6 && !worksOnSaturday) return true; // sábado no laboral
  return holidays.has(toDateKey(date));
}
