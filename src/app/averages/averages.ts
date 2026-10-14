import { Component, computed, signal } from '@angular/core';
import { dateKey, loadDays } from '../days';
import { CONDITIONS, findSymptom, Symptom } from '../settings/settings';

interface Row {
  symptom: Symptom;
  summary: string;
  /** 0-100 bar fill, or null when a bar doesn't apply. */
  percent: number | null;
  trend: 'up' | 'down' | null;
}

interface Range {
  label: string;
  /** Days back from today, or null for everything. */
  days: number | null;
}

const RANGES: Range[] = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: null },
];

const TREND_THRESHOLD = 0.5;
const MIN_POINTS_FOR_TREND = 4;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function trendOf(values: number[]): 'up' | 'down' | null {
  if (values.length < MIN_POINTS_FOR_TREND) return null;
  const half = Math.floor(values.length / 2);
  const change = mean(values.slice(-half)) - mean(values.slice(0, half));
  if (change >= TREND_THRESHOLD) return 'up';
  if (change <= -TREND_THRESHOLD) return 'down';
  return null;
}

function summarize(symptom: Symptom, values: (number | boolean | string | null)[]): Row | null {
  if (symptom.input === 'slider') {
    const nums = values.map(Number);
    const avg = mean(nums);
    return {
      symptom,
      summary: `${avg.toFixed(1)} / 10 average`,
      percent: avg * 10,
      trend: trendOf(nums),
    };
  }
  if (symptom.input === 'checkbox') {
    const count = values.filter(Boolean).length;
    return {
      symptom,
      summary: `${count} of ${values.length} days`,
      percent: (count / values.length) * 100,
      trend: null,
    };
  }
  const answers = values.filter((v): v is string => typeof v === 'string');
  if (answers.length === 0) return null;
  const counts = new Map<string, number>();
  for (const a of answers) counts.set(a, (counts.get(a) ?? 0) + 1);
  const [mode, k] = [...counts].sort((a, b) => b[1] - a[1])[0];
  return {
    symptom,
    summary: `Most often "${mode}" (${k} of ${answers.length} days)`,
    percent: null,
    trend: null,
  };
}

@Component({
  selector: 'app-averages',
  styleUrl: './averages.css',
  templateUrl: './averages.html',
})
export class Averages {
  protected readonly ranges = RANGES;
  private readonly days = loadDays();

  protected readonly range = signal<Range>(RANGES[1]);

  protected readonly dayCount = computed(() => this.datesInRange().length);

  protected readonly groups = computed(() => {
    const dates = this.datesInRange();
    const bySymptom = new Map<string, (number | boolean | string | null)[]>();
    for (const date of dates) {
      for (const [id, value] of Object.entries(this.days[date])) {
        bySymptom.set(id, [...(bySymptom.get(id) ?? []), value]);
      }
    }
    const rows = [...bySymptom].flatMap(([id, values]) => {
      const symptom = findSymptom(id);
      const row = symptom ? summarize(symptom, values) : null;
      return row ? [row] : [];
    });
    return CONDITIONS.map((c) => ({
      title: c.title,
      rows: rows.filter((r) => r.symptom.condition === c.id),
    })).filter((g) => g.rows.length > 0);
  });

  /** Logged dates inside the chosen range, oldest first. */
  private datesInRange(): string[] {
    const { days } = this.range();
    let cutoff = '';
    if (days !== null) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1));
      cutoff = dateKey(d);
    }
    return Object.keys(this.days)
      .filter((k) => k >= cutoff)
      .sort();
  }

  protected setRange(range: Range): void {
    this.range.set(range);
  }
}
