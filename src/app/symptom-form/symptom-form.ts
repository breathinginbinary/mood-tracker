import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DayEntry, DayValue, defaultValue } from '../days';
import { CONDITIONS, Symptom } from '../settings/settings';

@Component({
  selector: 'app-symptom-form',
  imports: [FormsModule],
  templateUrl: './symptom-form.html',
})
export class SymptomForm {
  readonly symptoms = input.required<Symptom[]>();
  readonly values = input.required<DayEntry>();
  readonly valuesChange = output<DayEntry>();

  protected readonly groups = computed(() =>
    CONDITIONS.map((c) => ({
      title: c.title,
      items: this.symptoms().filter((s) => s.condition === c.id),
    })).filter((g) => g.items.length > 0),
  );

  private readonly collapsed = signal<ReadonlySet<string>>(new Set());

  protected isOpen(title: string): boolean {
    return !this.collapsed().has(title);
  }

  protected toggle(title: string): void {
    const next = new Set(this.collapsed());
    if (!next.delete(title)) {
      next.add(title);
    }
    this.collapsed.set(next);
  }

  /** A symptom missing from the entry is one the user isn't tracking that day. */
  protected isTracked(id: string): boolean {
    return id in this.values();
  }

  protected setTracked(symptom: Symptom, tracked: boolean): void {
    if (tracked) {
      this.setValue(symptom.id, defaultValue(symptom));
      return;
    }
    const { [symptom.id]: _omitted, ...rest } = this.values();
    this.valuesChange.emit(rest);
  }

  protected setValue(id: string, value: DayValue): void {
    this.valuesChange.emit({ ...this.values(), [id]: value });
  }
}
