import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-test',
  imports: [FormsModule],
  templateUrl: './input-test.html',
})
export class InputTest {
  protected readonly scale = [0, 1, 2, 3, 4, 5];

  protected readonly slider = signal(3);
  protected readonly radio = signal<number | null>(null);
  protected readonly checkbox = signal(false);
  protected readonly numberInput = signal<number | null>(null);
  protected readonly toggle = signal(false);
}
