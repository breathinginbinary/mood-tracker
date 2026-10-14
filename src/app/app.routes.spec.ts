import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Analysis } from './analysis/analysis';
import { routes } from './app.routes';
import { Averages } from './averages/averages';
import { History } from './history/history';
import { Tracking } from './tracking/tracking';

describe('routes', () => {
  const componentFor = (path: string) => routes.find((r) => r.path === path)?.component;

  it('maps the main pages', () => {
    expect(componentFor('tracking')).toBe(Tracking);
    expect(componentFor('history')).toBe(History);
    expect(componentFor('analysis')).toBe(Analysis);
    expect(componentFor('analysis/averages')).toBe(Averages);
  });

  it('has a route for editing a day', () => {
    expect(routes.some((r) => r.path === 'history/:date/edit')).toBe(true);
  });

  it('navigates to the averages page', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);
    expect(await router.navigateByUrl('/analysis/averages')).toBe(true);
    expect(router.url).toBe('/analysis/averages');
  });
});
