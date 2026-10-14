import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DayEntry, defaultValue, deleteDay, loadDays, saveDay } from '../days';
import { findSymptom, loadSelectedSymptoms, Symptom } from '../settings/settings';
import { SymptomForm } from '../symptom-form/symptom-form';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Component({
  selector: 'app-day-edit',
  imports: [RouterLink, SymptomForm],
  templateUrl: './day-edit.html',
})
export class DayEdit {
  private readonly router = inject(Router);

  protected readonly date = inject(ActivatedRoute).snapshot.paramMap.get('date') ?? '';
  protected readonly valid = DATE_PATTERN.test(this.date);
  protected readonly label = this.valid ? this.formatDate(this.date) : '';
  protected readonly hasEntry = this.valid && this.date in loadDays();
  protected readonly confirmingDelete = signal(false);
  protected readonly symptoms: Symptom[];
  protected readonly values = signal<DayEntry>({});

  constructor() {
    const existing = this.valid ? loadDays()[this.date] : undefined;
    const symptoms = loadSelectedSymptoms();
    // Keep answers for symptoms that are no longer selected so saving doesn't drop them.
    for (const id of Object.keys(existing ?? {})) {
      const symptom = findSymptom(id);
      if (symptom && !symptoms.some((s) => s.id === id)) symptoms.push(symptom);
    }
    this.symptoms = symptoms;
    // A symptom missing from a saved entry was marked "not tracking" that day.
    this.values.set(existing ?? Object.fromEntries(symptoms.map((s) => [s.id, defaultValue(s)])));
  }

  protected remove(): void {
    deleteDay(this.date);
    this.router.navigate(['/history'], { queryParams: { date: this.date } });
  }

  protected save(): void {
    saveDay(this.date, this.values());
    this.router.navigate(['/history'], { queryParams: { date: this.date } });
  }

  private formatDate(key: string): string {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
