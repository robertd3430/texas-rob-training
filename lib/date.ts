// Local calendar date as YYYY-MM-DD. Deliberately not `date.toISOString()`
// — that converts to UTC first, which silently shifts the date near
// midnight for any timezone behind UTC (e.g. 9pm CDT is already the next
// day in UTC).
export function todayIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Matches Postgres date_trunc('week', ...), which truncates to the Monday
// of the ISO week — so week_start rows can be looked up directly.
export function currentWeekStartIsoDate(date = new Date()): string {
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysSinceMonday);
  return todayIsoDate(monday);
}
