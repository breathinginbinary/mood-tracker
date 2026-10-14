import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { dateKey, loadDays } from '../days';
import { Tracking } from './tracking';

const RACING = 'bipolar:Racing thoughts';
const PURCHASE = 'adhd:Impulse purchase';

function create(selected: string[]) {
  localStorage.setItem('mood-tracker.settings', JSON.stringify({ selected }));
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Tracking);
  fixture.detectChanges();
  return {
    fixture,
    tracking: fixture.componentInstance as any,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('Tracking', () => {
  beforeEach(() => localStorage.clear());

  it('starts every selected symptom at its default', () => {
    const { tracking } = create([RACING, PURCHASE]);
    expect(tracking.values()).toEqual({ [RACING]: 0, [PURCHASE]: false });
  });

  it('points to settings and disables buttons when nothing is selected', () => {
    const { el } = create([]);
    expect(el.textContent).toContain('No symptoms selected yet');
    el.querySelectorAll('button').forEach((b) => expect(b.disabled).toBe(true));
  });

  it('reset restores defaults and re-tracks skipped symptoms', () => {
    const { tracking } = create([RACING, PURCHASE]);
    tracking.onValuesChange({ [RACING]: 8 });
    tracking.reset();
    expect(tracking.values()).toEqual({ [RACING]: 0, [PURCHASE]: false });
  });

  it('reset clears the saved confirmation', () => {
    const { tracking } = create([RACING]);
    tracking.submitDay();
    tracking.reset();
    expect(tracking.submittedAt()).toBeNull();
  });

  it('the Reset button resets the form', () => {
    const { fixture, tracking, el } = create([RACING]);
    tracking.onValuesChange({ [RACING]: 5 });
    const reset = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Reset',
    )!;
    reset.click();
    fixture.detectChanges();
    expect(tracking.values()).toEqual({ [RACING]: 0 });
  });

  it('submitting saves today, omitting skipped symptoms, and resets the form', () => {
    const { tracking } = create([RACING, PURCHASE]);
    tracking.onValuesChange({ [RACING]: 6 });
    tracking.submitDay();
    const today = dateKey(new Date());
    expect(loadDays()[today]).toEqual({ [RACING]: 6 });
    expect(tracking.submittedAt()).toBe(today);
    expect(tracking.values()).toEqual({ [RACING]: 0, [PURCHASE]: false });
  });

  it('editing after a submit hides the confirmation', () => {
    const { tracking } = create([RACING]);
    tracking.submitDay();
    tracking.onValuesChange({ [RACING]: 2 });
    expect(tracking.submittedAt()).toBeNull();
  });
});
