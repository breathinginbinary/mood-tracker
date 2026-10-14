import { dateKey, defaultValue, deleteDay, loadDays, saveDay } from './days';
import { findSymptom } from './settings/settings';

describe('days', () => {
  beforeEach(() => localStorage.clear());

  it('formats local dates as zero-padded YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('returns no days when nothing is stored', () => {
    expect(loadDays()).toEqual({});
  });

  it('returns no days when storage is corrupt', () => {
    localStorage.setItem('mood-tracker.days', '{not json');
    expect(loadDays()).toEqual({});
  });

  it('saves and reloads a day, keeping other days', () => {
    saveDay('2026-01-01', { a: 1 });
    saveDay('2026-01-02', { b: true });
    expect(loadDays()).toEqual({ '2026-01-01': { a: 1 }, '2026-01-02': { b: true } });
  });

  it('overwrites an existing day', () => {
    saveDay('2026-01-01', { a: 1 });
    saveDay('2026-01-01', { a: 2 });
    expect(loadDays()).toEqual({ '2026-01-01': { a: 2 } });
  });

  it('deletes only the requested day', () => {
    saveDay('2026-01-01', { a: 1 });
    saveDay('2026-01-02', { a: 2 });
    deleteDay('2026-01-01');
    expect(loadDays()).toEqual({ '2026-01-02': { a: 2 } });
  });

  it('ignores deleting a day that does not exist', () => {
    saveDay('2026-01-01', { a: 1 });
    deleteDay('2030-01-01');
    expect(loadDays()).toEqual({ '2026-01-01': { a: 1 } });
  });

  it('does not throw when storage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(() => saveDay('2026-01-01', {})).not.toThrow();
    expect(() => deleteDay('2026-01-01')).not.toThrow();
    spy.mockRestore();
  });

  it('has a default for each input type', () => {
    expect(defaultValue(findSymptom('bipolar:Racing thoughts')!)).toBe(0);
    expect(defaultValue(findSymptom('adhd:Impulse purchase')!)).toBe(false);
    expect(defaultValue(findSymptom('adhd:Mood swings')!)).toBeNull();
  });
});
