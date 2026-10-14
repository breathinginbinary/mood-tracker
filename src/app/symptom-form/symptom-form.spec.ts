import { TestBed } from '@angular/core/testing';
import { DayEntry } from '../days';
import { findSymptom } from '../settings/settings';
import { SymptomForm } from './symptom-form';

const slider = findSymptom('bipolar:Racing thoughts')!;
const check = findSymptom('adhd:Impulse purchase')!;
const radio = findSymptom('adhd:Mood swings')!;

function setup(values: DayEntry) {
  const fixture = TestBed.createComponent(SymptomForm);
  fixture.componentRef.setInput('symptoms', [slider, check, radio]);
  fixture.componentRef.setInput('values', values);
  fixture.detectChanges();
  const emitted: DayEntry[] = [];
  fixture.componentInstance.valuesChange.subscribe((v) => emitted.push(v));
  return {
    fixture,
    emitted,
    form: fixture.componentInstance as any,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('SymptomForm', () => {
  it('groups symptoms by condition', () => {
    const { form } = setup({});
    expect(form.groups().map((g: any) => g.title)).toEqual(['Bipolar', 'ADHD']);
  });

  it('hides groups with no symptoms', () => {
    const { fixture, form } = setup({});
    fixture.componentRef.setInput('symptoms', [slider]);
    expect(form.groups().map((g: any) => g.title)).toEqual(['Bipolar']);
  });

  it('treats a symptom as tracked only when it is in the entry', () => {
    const { form } = setup({ [slider.id]: 3 });
    expect(form.isTracked(slider.id)).toBe(true);
    expect(form.isTracked(check.id)).toBe(false);
  });

  it('emits the new value and keeps the others', () => {
    const { form, emitted } = setup({ [slider.id]: 0, [check.id]: false });
    form.setValue(slider.id, 7);
    expect(emitted).toEqual([{ [slider.id]: 7, [check.id]: false }]);
  });

  it('removes a symptom from the entry when marked not tracking', () => {
    const { form, emitted } = setup({ [slider.id]: 4, [check.id]: true });
    form.setTracked(slider, false);
    expect(emitted).toEqual([{ [check.id]: true }]);
  });

  it('restores the default when tracking resumes', () => {
    const { form, emitted } = setup({ [check.id]: true });
    form.setTracked(slider, true);
    form.setTracked(radio, true);
    expect(emitted[0]).toEqual({ [check.id]: true, [slider.id]: 0 });
    expect(emitted[1]).toEqual({ [check.id]: true, [radio.id]: null });
  });

  it('shows a dash instead of the value when not tracked', () => {
    const { el } = setup({ [check.id]: false });
    expect(el.querySelector('strong')?.textContent).toBe('–');
  });

  it('renders a "Not tracking today" box per symptom, ticked when untracked', () => {
    const { el } = setup({ [slider.id]: 1 });
    const boxes = Array.from(el.querySelectorAll<HTMLInputElement>('input[id^="skip-"]'));
    expect(boxes).toHaveLength(3);
    expect(boxes.map((b) => b.checked)).toEqual([false, true, true]);
  });

  it('emits when the skip box is ticked', () => {
    const { el, emitted } = setup({ [slider.id]: 1 });
    const box = el.querySelector<HTMLInputElement>('input[id^="skip-"]')!;
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    expect(emitted).toEqual([{}]);
  });

  it('disables the inputs of untracked symptoms', async () => {
    const { fixture, el } = setup({});
    await fixture.whenStable();
    expect(el.querySelector<HTMLInputElement>('input[type="range"]')!.disabled).toBe(true);
  });
});
