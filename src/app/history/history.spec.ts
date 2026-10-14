import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { dateKey, saveDay } from '../days';
import { History } from './history';

const RACING = 'bipolar:Racing thoughts';
const PURCHASE = 'adhd:Impulse purchase';

function create(date?: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(date ? { date } : {}) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(History);
  fixture.detectChanges();
  return { history: fixture.componentInstance as any };
}

describe('History', () => {
  beforeEach(() => localStorage.clear());

  it('shows the current month with nothing selected', () => {
    const { history } = create();
    const today = new Date();
    expect(history.month().getMonth()).toBe(today.getMonth());
    expect(history.selected()).toBeNull();
    expect(history.groups()).toEqual([]);
  });

  it('opens on the date passed back from the editor', () => {
    const { history } = create('2025-02-10');
    expect(history.selected()).toBe('2025-02-10');
    expect(history.month().getFullYear()).toBe(2025);
    expect(history.month().getMonth()).toBe(1);
  });

  it('ignores a malformed date parameter', () => {
    const { history } = create('garbage');
    expect(history.selected()).toBeNull();
  });

  it('builds a calendar padded to the first weekday', () => {
    const { history } = create('2026-02-10');
    const cells = history.cells();
    const first = new Date(2026, 1, 1).getDay();
    expect(cells.slice(0, first).every((c: unknown) => c === null)).toBe(true);
    expect(cells.filter(Boolean)).toHaveLength(28);
    expect(cells[first]).toMatchObject({ key: '2026-02-01', day: 1 });
  });

  it('marks days with entries and today', () => {
    const today = dateKey(new Date());
    saveDay(today, { [RACING]: 1 });
    const { history } = create();
    const cell = history.cells().find((c: any) => c?.key === today);
    expect(cell).toMatchObject({ hasEntry: true, isToday: true });
    expect(history.cells().filter((c: any) => c?.hasEntry)).toHaveLength(1);
  });

  it('moves between months across year boundaries', () => {
    const { history } = create('2026-01-15');
    history.shiftMonth(-1);
    expect([history.month().getFullYear(), history.month().getMonth()]).toEqual([2025, 11]);
    history.shiftMonth(2);
    expect([history.month().getFullYear(), history.month().getMonth()]).toEqual([2026, 1]);
  });

  it('labels the month and the selected day', () => {
    const { history } = create('2026-01-15');
    expect(history.monthLabel()).toContain('2026');
    expect(history.selectedLabel()).toContain('15');
  });

  it('formats each symptom type for the selected day, grouped by condition', () => {
    saveDay('2026-01-15', { [RACING]: 7, [PURCHASE]: true, 'adhd:Mood swings': null });
    const { history } = create('2026-01-15');
    const groups = history.groups();
    expect(groups.map((g: any) => g.title)).toEqual(['Bipolar', 'ADHD']);
    expect(groups[0].rows[0].display).toBe('7 / 10');
    expect(groups[1].rows.map((r: any) => r.display)).toEqual(['Yes', 'Not answered']);
  });

  it('skips unknown symptom ids and omitted symptoms', () => {
    saveDay('2026-01-15', { 'gone:thing': 3, [RACING]: 1 });
    const { history } = create('2026-01-15');
    expect(history.groups().flatMap((g: any) => g.rows)).toHaveLength(1);
  });

  it('reports whether the selected day has an entry', () => {
    saveDay('2026-01-15', { [RACING]: 1 });
    const { history } = create('2026-01-15');
    expect(history.hasEntry()).toBe(true);
    history.select('2026-01-16');
    expect(history.hasEntry()).toBe(false);
  });
});
