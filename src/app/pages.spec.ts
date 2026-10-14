import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Account } from './account/account';
import { Analysis } from './analysis/analysis';
import { InputTest } from './input-test/input-test';
import { Login } from './login/login';
import { Logout } from './logout/logout';

function render(component: Type<unknown>) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('simple pages', () => {
  it('Analysis renders its heading', () => {
    expect(render(Analysis).querySelector('h1')?.textContent).toBe('Analysis');
  });

  it('Account renders its heading', () => {
    expect(render(Account).querySelector('h1')?.textContent).toBe('Account');
  });

  it('Login renders', () => {
    expect(render(Login).textContent?.trim()).not.toBe('');
  });

  it('Logout links back to login', () => {
    const el = render(Logout);
    expect(el.textContent).toContain('logged out');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/login');
  });
});

describe('InputTest', () => {
  it('starts with the documented defaults', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(InputTest);
    fixture.detectChanges();
    const page = fixture.componentInstance as any;
    expect(page.scale).toEqual([0, 1, 2, 3, 4, 5]);
    expect(page.slider()).toBe(3);
    expect(page.radio()).toBeNull();
    expect(page.checkbox()).toBe(false);
    expect(page.numberInput()).toBeNull();
    expect(page.toggle()).toBe(false);
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Input test');
  });
});
