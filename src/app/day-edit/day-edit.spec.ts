import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { loadDays, saveDay } from '../days';
import { DayEdit } from './day-edit';

const RACING = 'bipolar:Racing thoughts';
const PURCHASE = 'adhd:Impulse purchase';
const DATE = '2026-03-04';

function create(date: string, selected: string[] = [RACING, PURCHASE]) {
  localStorage.setItem('mood-tracker.settings', JSON.stringify({ selected }));
  const navigate = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ date }) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(DayEdit);
  fixture.detectChanges();
  return {
    fixture,
    edit: fixture.componentInstance as any,
    navigate,
    el: fixture.nativeElement as HTMLElement,
  };
}

const button = (el: HTMLElement, text: string) =>
  Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === text);

describe('DayEdit', () => {
  beforeEach(() => localStorage.clear());

  it('rejects an invalid date', () => {
    const { edit, el } = create('not-a-date');
    expect(edit.valid).toBe(false);
    expect(el.textContent).toContain("That date isn't valid");
  });

  it('starts a new day at defaults', () => {
    const { edit } = create(DATE);
    expect(edit.values()).toEqual({ [RACING]: 0, [PURCHASE]: false });
    expect(edit.hasEntry).toBe(false);
  });

  it('loads an existing entry as-is, leaving skipped symptoms out', () => {
    saveDay(DATE, { [RACING]: 7 });
    const { edit } = create(DATE);
    expect(edit.values()).toEqual({ [RACING]: 7 });
  });

  it('keeps answers for symptoms that are no longer selected', () => {
    saveDay(DATE, { [RACING]: 7, [PURCHASE]: true });
    const { edit } = create(DATE, [RACING]);
    expect(edit.symptoms.map((s: any) => s.id)).toEqual([RACING, PURCHASE]);
  });

  it('formats the date in the heading', () => {
    const { edit } = create(DATE);
    expect(edit.label).toContain('2026');
    expect(edit.label).toContain('4');
  });

  it('saves and returns to history on that date', () => {
    const { edit, navigate } = create(DATE);
    edit.values.set({ [RACING]: 3 });
    edit.save();
    expect(loadDays()[DATE]).toEqual({ [RACING]: 3 });
    expect(navigate).toHaveBeenCalledWith(['/history'], { queryParams: { date: DATE } });
  });

  it('hides the delete button for a day without an entry', () => {
    const { el } = create(DATE);
    expect(button(el, 'Delete')).toBeUndefined();
  });

  it('asks for confirmation before deleting', () => {
    saveDay(DATE, { [RACING]: 1 });
    const { fixture, el } = create(DATE);
    button(el, 'Delete')!.click();
    fixture.detectChanges();
    expect(loadDays()[DATE]).toBeDefined();
    expect(button(el, 'Confirm delete')).toBeDefined();
    button(el, 'Keep')!.click();
    fixture.detectChanges();
    expect(button(el, 'Delete')).toBeDefined();
    expect(button(el, 'Confirm delete')).toBeUndefined();
  });

  it('deletes only that day once confirmed, then returns to history', () => {
    saveDay(DATE, { [RACING]: 1 });
    saveDay('2026-03-05', { [RACING]: 2 });
    const { fixture, el, navigate } = create(DATE);
    button(el, 'Delete')!.click();
    fixture.detectChanges();
    button(el, 'Confirm delete')!.click();
    expect(loadDays()).toEqual({ '2026-03-05': { [RACING]: 2 } });
    expect(navigate).toHaveBeenCalledWith(['/history'], { queryParams: { date: DATE } });
  });
});
