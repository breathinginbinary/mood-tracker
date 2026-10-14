import type { Symptom } from './settings/settings';

export type DayValue = number | boolean | string | null;
export type DayEntry = Record<string, DayValue>;

const DAYS_KEY = 'mood-tracker.days';

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Every submitted day, keyed by date. */
export function loadDays(): Record<string, DayEntry> {
  try {
    return JSON.parse(localStorage.getItem(DAYS_KEY) ?? '{}') as Record<string, DayEntry>;
  } catch {
    return {};
  }
}

/** The value a symptom's input starts at before the user touches it. */
export function defaultValue(symptom: Symptom): DayValue {
  switch (symptom.input) {
    case 'slider':
      return 0;
    case 'checkbox':
      return false;
    case 'radio':
      return null;
  }
}

export function saveDay(date: string, entry: DayEntry): void {
  try {
    const days = loadDays();
    days[date] = entry;
    localStorage.setItem(DAYS_KEY, JSON.stringify(days));
  } catch {
    // storage unavailable; nothing to persist
  }
}

export function deleteDay(date: string): void {
  try {
    const days = loadDays();
    delete days[date];
    localStorage.setItem(DAYS_KEY, JSON.stringify(days));
  } catch {
    // storage unavailable; nothing to delete
  }
}
