import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DayEntry, dateKey, defaultValue, saveDay } from '../days';
import { loadSelectedSymptoms } from '../settings/settings';
import { SymptomForm } from '../symptom-form/symptom-form';

@Component({
  selector: 'app-tracking',
  imports: [RouterLink, SymptomForm],
  styleUrl: './tracking.css',
  templateUrl: './tracking.html',
})
export class Tracking {
  protected readonly symptoms = loadSelectedSymptoms();
  protected readonly values = signal<DayEntry>(this.emptyValues());
  protected readonly submittedAt = signal<string | null>(null);

  protected onValuesChange(values: DayEntry): void {
    this.values.set(values);
    this.submittedAt.set(null);
  }

  protected reset(): void {
    this.values.set(this.emptyValues());
    this.submittedAt.set(null);
  }

  protected submitDay(): void {
    const date = dateKey(new Date());
    saveDay(date, this.values());
    this.values.set(this.emptyValues());
    this.submittedAt.set(date);
  }

  private emptyValues(): DayEntry {
    return Object.fromEntries(this.symptoms.map((s) => [s.id, defaultValue(s)]));
  }
}
