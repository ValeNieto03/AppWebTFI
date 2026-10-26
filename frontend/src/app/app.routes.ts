import { Routes } from '@angular/router';
import { rolGuard } from './guards/rol-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () =>
      import('./pages/admin/admin').then((m) => m.Admin),
  },
  {
    path: 'paciente',
    canActivate: [rolGuard],
    data: { roles: ['PACIENTE'] },
    loadComponent: () =>
      import('./pages/paciente/paciente').then((m) => m.Paciente),
  },
  {
    path: 'medico',
    canActivate: [rolGuard],
    data: { roles: ['MEDICO'] },
    loadComponent: () =>
      import('./pages/medico/medico').then((m) => m.Medico),
  },
];