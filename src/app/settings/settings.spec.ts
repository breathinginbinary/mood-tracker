import { TestBed } from '@angular/core/testing';
import { findSymptom, loadSelectedSymptoms, Settings } from './settings';

const KEY = 'mood-tracker.settings';
const RACING = 'bipolar:Racing thoughts';
const PURCHASE = 'adhd:Impulse purchase';

const stored = () => JSON.parse(localStorage.getItem(KEY)!);
const select = (value: string) => ({ value }) as HTMLSelectElement;

describe('settings helpers', () => {
  beforeEach(() => localStorage.clear());

  it('finds a symptom by id', () => {
    expect(findSymptom(RACING)).toMatchObject({ condition: 'bipolar', input: 'slider' });
    expect(findSymptom('nope')).toBeUndefined();
  });

  it('loads selected symptoms in order, skipping unknown ids', () => {
    localStorage.setItem(KEY, JSON.stringify({ selected: [PURCHASE, 'gone', RACING] }));
    expect(loadSelectedSymptoms().map((s) => s.id)).toEqual([PURCHASE, RACING]);
  });

  it('loads nothing when storage is empty or corrupt', () => {
    expect(loadSelectedSymptoms()).toEqual([]);
    localStorage.setItem(KEY, 'garbage');
    expect(loadSelectedSymptoms()).toEqual([]);
  });
});

describe('Settings', () => {
  let settings: any;

  function create() {
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    settings = fixture.componentInstance;
    return fixture;
  }

  beforeEach(() => localStorage.clear());

  it('offers no symptoms until a condition is enabled', () => {
    create();
    expect(settings.available()).toEqual([]);
  });

  it('offers only the enabled condition and persists the toggle', () => {
    create();
    settings.setCondition('bipolar', true);
    expect(settings.available().map((g: any) => g.id)).toEqual(['bipolar']);
    expect(stored().bipolar).toBe(true);
  });

  it('offers anxiety, depression and schizophrenia symptoms when enabled', () => {
    create();
    for (const id of ['anxiety', 'depression', 'schizophrenia']) {
      settings.setCondition(id, true);
    }
    const groups = settings.available();
    expect(groups.map((g: any) => g.title)).toEqual(['Anxiety', 'Depression', 'Schizophrenia']);
    for (const g of groups) {
      expect(g.symptoms.length).toBeGreaterThan(0);
      expect(g.symptoms.every((s: any) => s.condition === g.id)).toBe(true);
    }
    expect(stored()).toMatchObject({ anxiety: true, depression: true, schizophrenia: true });
  });

  it('hides a condition\'s symptoms again when it is unchecked', () => {
    create();
    settings.setCondition('anxiety', true);
    settings.setCondition('anxiety', false);
    expect(settings.available()).toEqual([]);
  });

  it('adds a symptom from a select and removes it from the available list', () => {
    create();
    settings.setCondition('bipolar', true);
    const el = select(RACING);
    settings.add(el);
    expect(settings.chosen().map((s: any) => s.id)).toEqual([RACING]);
    expect(
      settings.available().some((g: any) => g.symptoms.some((s: any) => s.id === RACING)),
    ).toBe(false);
    expect(el.value).toBe('');
    expect(stored().selected).toEqual([RACING]);
  });

  it('ignores an empty or duplicate selection', () => {
    create();
    settings.setCondition('bipolar', true);
    settings.add(select(''));
    settings.add(select(RACING));
    settings.add(select(RACING));
    expect(settings.chosen()).toHaveLength(1);
  });

  it('adds all available symptoms for enabled conditions', () => {
    create();
    settings.setCondition('adhd', true);
    const count = settings.available()[0].symptoms.length;
    settings.addAll();
    expect(settings.chosen()).toHaveLength(count);
    expect(settings.available()).toEqual([]);
  });

  it('removes one symptom, then all', () => {
    create();
    settings.setCondition('bipolar', true);
    settings.add(select(RACING));
    settings.remove(RACING);
    expect(settings.chosen()).toEqual([]);
    settings.addAll();
    expect(settings.chosen().length).toBeGreaterThan(1);
    settings.removeAll();
    expect(settings.chosen()).toEqual([]);
    expect(stored().selected).toEqual([]);
  });

  it('restores saved state', () => {
    localStorage.setItem(KEY, JSON.stringify({ bipolar: true, adhd: false, selected: [RACING] }));
    create();
    expect(settings.enabled().bipolar).toBe(true);
    expect(settings.enabled().anxiety).toBe(false);
    expect(settings.chosen().map((s: any) => s.id)).toEqual([RACING]);
  });
});
