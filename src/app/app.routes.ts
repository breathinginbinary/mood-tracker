import { Routes } from '@angular/router';
import { Account } from './account/account';
import { Analysis } from './analysis/analysis';
import { Averages } from './averages/averages';
import { DayEdit } from './day-edit/day-edit';
import { History } from './history/history';
import { InputTest } from './input-test/input-test';
import { Login } from './login/login';
import { Logout } from './logout/logout';
import { Settings } from './settings/settings';
import { Tracking } from './tracking/tracking';

export const routes: Routes = [
  { path: '', component: InputTest },
  { path: 'login', component: Login },
  { path: 'logout', component: Logout },
  { path: 'tracking', component: Tracking },
  { path: 'history', component: History },
  { path: 'history/:date/edit', component: DayEdit },
  { path: 'analysis', component: Analysis },
  { path: 'analysis/averages', component: Averages },
  { path: 'account', component: Account },
  { path: 'settings', component: Settings },
];
