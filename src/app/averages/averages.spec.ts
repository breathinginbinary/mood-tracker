import { TestBed } from '@angular/core/testing';
import { dateKey, saveDay } from '../days';
import { Averages } from './averages';

const RACING = 'bipolar:Racing thoughts';
const PURCHASE = 'adhd:Impulse purchase';
const MOOD = 'adhd:Mood swings';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

function create() {
  const fixture = TestBed.createComponent(Averages);
  fixture.detectChanges();
  return {
    fixture,
    averages: fixture.componentInstance as any,
    el: fixture.nativeElement as HTMLElement,
  };
}

const rows = (averages: any) => averages.groups().flatMap((g: any) => g.rows);
const rowFor = (averages: any, id: string) => rows(averages).find((r: any) => r.symptom.id === id);

describe('Averages', () => {
  beforeEach(() => localStorage.clear());

  it('says so when there are no entries in range', () => {
    const { el, averages } = create();
    expect(averages.dayCount()).toBe(0);
    expect(el.textContent).toContain('No entries logged');
  });

  it('defaults to 30 days and excludes older entries', () => {
    saveDay(daysAgo(1), { [RACING]: 4 });
    saveDay(daysAgo(60), { [RACING]: 10 });
    const { averages } = create();
    expect(averages.range().label).toBe('30 days');
    expect(averages.dayCount()).toBe(1);
  });

  it('includes older entries when the range widens', () => {
    saveDay(daysAgo(1), { [RACING]: 4 });
    saveDay(daysAgo(60), { [RACING]: 10 });
    const { averages } = create();
    averages.setRange(averages.ranges[3]);
    expect(averages.dayCount()).toBe(2);
    expect(rowFor(averages, RACING).summary).toBe('7.0 / 10 average');
  });

  it('averages sliders and fills the bar', () => {
    saveDay(daysAgo(1), { [RACING]: 2 });
    saveDay(daysAgo(2), { [RACING]: 5 });
    const { averages } = create();
    expect(rowFor(averages, RACING)).toMatchObject({
      summary: '3.5 / 10 average',
      percent: 35,
    });
  });

  it('does not count days a symptom was not tracked as zero', () => {
    saveDay(daysAgo(1), { [RACING]: 8 });
    saveDay(daysAgo(2), { [PURCHASE]: true });
    saveDay(daysAgo(3), {});
    const { averages } = create();
    expect(rowFor(averages, RACING).summary).toBe('8.0 / 10 average');
    expect(rowFor(averages, PURCHASE).summary).toBe('1 of 1 days');
  });

  it('counts checkbox days', () => {
    saveDay(daysAgo(1), { [PURCHASE]: true });
    saveDay(daysAgo(2), { [PURCHASE]: false });
    saveDay(daysAgo(3), { [PURCHASE]: false });
    const { averages } = create();
    const row = rowFor(averages, PURCHASE);
    expect(row.summary).toBe('1 of 3 days');
    expect(row.percent).toBeCloseTo(33.3, 1);
  });

  it('reports the most common answer for radios and ignores unanswered ones', () => {
    saveDay(daysAgo(1), { [MOOD]: 'Mild' });
    saveDay(daysAgo(2), { [MOOD]: 'Severe' });
    saveDay(daysAgo(3), { [MOOD]: 'Mild' });
    saveDay(daysAgo(4), { [MOOD]: null });
    const { averages } = create();
    expect(rowFor(averages, MOOD)).toMatchObject({
      summary: 'Most often "Mild" (2 of 3 days)',
      percent: null,
    });
  });

  it('omits a radio that was never answered', () => {
    saveDay(daysAgo(1), { [MOOD]: null });
    const { averages } = create();
    expect(rowFor(averages, MOOD)).toBeUndefined();
  });

  it('shows an upward trend with enough data', () => {
    [0, 0, 10, 10].forEach((v, i) => saveDay(daysAgo(4 - i), { [RACING]: v }));
    const { averages } = create();
    expect(rowFor(averages, RACING).trend).toBe('up');
  });

  it('shows a downward trend', () => {
    [10, 10, 0, 0].forEach((v, i) => saveDay(daysAgo(4 - i), { [RACING]: v }));
    const { averages } = create();
    expect(rowFor(averages, RACING).trend).toBe('down');
  });

  it('shows no trend with too little data', () => {
    saveDay(daysAgo(1), { [RACING]: 0 });
    saveDay(daysAgo(2), { [RACING]: 10 });
    const { averages } = create();
    expect(rowFor(averages, RACING).trend).toBeNull();
  });

  it('shows no trend when the change is small', () => {
    [5, 5, 5, 5].forEach((v, i) => saveDay(daysAgo(i + 1), { [RACING]: v }));
    const { averages } = create();
    expect(rowFor(averages, RACING).trend).toBeNull();
  });

  it('groups results by condition, hiding empty groups', () => {
    saveDay(daysAgo(1), { [RACING]: 1 });
    const { averages } = create();
    expect(averages.groups().map((g: any) => g.title)).toEqual(['Bipolar']);
  });

  it('ignores unknown symptom ids', () => {
    saveDay(daysAgo(1), { 'gone:thing': 5 });
    const { averages } = create();
    expect(rows(averages)).toEqual([]);
  });

  it('renders the day count and re-renders when the range changes', () => {
    saveDay(daysAgo(1), { [RACING]: 1 });
    saveDay(daysAgo(60), { [RACING]: 1 });
    const { fixture, el, averages } = create();
    expect(el.textContent).toContain('Based on 1 day of entries');
    averages.setRange(averages.ranges[3]);
    fixture.detectChanges();
    expect(el.textContent).toContain('Based on 2 days of entries');
  });
});
