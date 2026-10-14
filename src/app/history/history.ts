import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DayEntry, DayValue, dateKey, loadDays } from '../days';
import { CONDITIONS, findSymptom, Symptom } from '../settings/settings';

interface Cell {
  key: string;
  day: number;
  hasEntry: boolean;
  isToday: boolean;
}

interface Row {
  symptom: Symptom;
  display: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function display(symptom: Symptom, value: DayValue): string {
  if (symptom.input === 'slider') return `${value ?? 0} / 10`;
  if (symptom.input === 'checkbox') return value ? 'Yes' : 'No';
  return value == null ? 'Not answered' : String(value);
}

@Component({
  selector: 'app-history',
  imports: [RouterLink],
  styleUrl: './history.css',
  templateUrl: './history.html',
})
export class History {
  protected readonly weekdays = WEEKDAYS;
  private readonly days = loadDays();
  private readonly todayKey = dateKey(new Date());

  /** First day of the month being shown. */
  protected readonly month: WritableSignal<Date>;
  protected readonly selected: WritableSignal<string | null>;

  constructor() {
    // Returning from the day editor passes the edited date back so it stays selected.
    const date = inject(ActivatedRoute).snapshot.queryParamMap.get('date');
    const initial = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
    const [y, m] = (initial ?? this.todayKey).split('-').map(Number);
    this.month = signal(new Date(y, m - 1, 1));
    this.selected = signal(initial);
  }

  protected readonly monthLabel = computed(() =>
    this.month().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
  );

  /** Leading nulls pad the first week so day 1 lands on the right weekday. */
  protected readonly cells = computed<(Cell | null)[]>(() => {
    const first = this.month();
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const blanks = Array<null>(first.getDay()).fill(null);
    const days = Array.from({ length: count }, (_, i): Cell => {
      const key = dateKey(new Date(first.getFullYear(), first.getMonth(), i + 1));
      return { key, day: i + 1, hasEntry: key in this.days, isToday: key === this.todayKey };
    });
    return [...blanks, ...days];
  });

  protected readonly selectedLabel = computed(() => {
    const key = this.selected();
    if (!key) return '';
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });

  protected readonly groups = computed(() => {
    const key = this.selected();
    const entry: DayEntry | undefined = key ? this.days[key] : undefined;
    if (!entry) return [];
    const rows: Row[] = Object.entries(entry).flatMap(([id, value]) => {
      const symptom = findSymptom(id);
      return symptom ? [{ symptom, display: display(symptom, value) }] : [];
    });
    return CONDITIONS.map((c) => ({
      title: c.title,
      rows: rows.filter((r) => r.symptom.condition === c.id),
    })).filter((g) => g.rows.length > 0);
  });

  protected readonly hasEntry = computed(() => {
    const key = this.selected();
    return !!key && key in this.days;
  });

  protected shiftMonth(delta: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  protected select(key: string): void {
    this.selected.set(key);
  }
}
