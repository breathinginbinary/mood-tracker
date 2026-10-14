import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
  children?: NavLink[];
}

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('mood-tracker');
  protected readonly menuOpen = signal(false);
  protected readonly openDropdown = signal<string | null>(null);

  protected readonly links: NavLink[] = [
    { path: '/tracking', label: 'Tracking' },
    { path: '/history', label: 'History' },
    {
      path: '/analysis',
      label: 'Analysis',
      children: [{ path: '/analysis/averages', label: 'Averages' }],
    },
    { path: '/account', label: 'Account' },
    { path: '/settings', label: 'Settings' },
    { path: '/login', label: 'Login' },
    { path: '/logout', label: 'Logout' },
  ];

  protected toggleDropdown(label: string): void {
    this.openDropdown.set(this.openDropdown() === label ? null : label);
  }

  protected closeMenus(): void {
    this.menuOpen.set(false);
    this.openDropdown.set(null);
  }
}
