import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('lists the top-level links in order', () => {
    const { el } = create();
    const labels = Array.from(el.querySelectorAll('.navbar-nav > li > a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(labels).toEqual([
      'Tracking',
      'History',
      'Analysis',
      'Account',
      'Settings',
      'Login',
      'Logout',
    ]);
  });

  it('makes Analysis a dropdown containing Averages', () => {
    const { el } = create();
    const dropdown = el.querySelector('li.dropdown')!;
    expect(dropdown.querySelector('.dropdown-toggle')?.textContent?.trim()).toBe('Analysis');
    expect(
      Array.from(dropdown.querySelectorAll('.dropdown-item')).map((a) => a.textContent?.trim()),
    ).toEqual(['Averages']);
    expect(dropdown.querySelector('.dropdown-item')?.getAttribute('href')).toBe(
      '/analysis/averages',
    );
  });

  it('opens and closes the dropdown from the toggle', () => {
    const { fixture, el } = create();
    const toggle = el.querySelector<HTMLElement>('.dropdown-toggle')!;
    const menu = el.querySelector('.dropdown-menu')!;
    expect(menu.classList.contains('show')).toBe(false);
    toggle.click();
    fixture.detectChanges();
    expect(menu.classList.contains('show')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    fixture.detectChanges();
    expect(menu.classList.contains('show')).toBe(false);
  });

  it('closes the dropdown and mobile menu after choosing an item', () => {
    const { fixture, el } = create();
    el.querySelector<HTMLElement>('.navbar-toggler')!.click();
    el.querySelector<HTMLElement>('.dropdown-toggle')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLElement>('.dropdown-item')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.dropdown-menu')!.classList.contains('show')).toBe(false);
    expect(el.querySelector('.navbar-collapse')!.classList.contains('show')).toBe(false);
  });

  it('toggles the mobile menu', () => {
    const { fixture, el } = create();
    const collapse = el.querySelector('.navbar-collapse')!;
    el.querySelector<HTMLElement>('.navbar-toggler')!.click();
    fixture.detectChanges();
    expect(collapse.classList.contains('show')).toBe(true);
  });
});
