import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { rol: 'Administrador' },
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.Admin),
  },
  {
  path: 'admin/turnos',
  canActivate: [authGuard],
  data: { rol: 'Administrador' },
  loadComponent: () =>
    import('./pages/admin-turnos/admin-turnos')
      .then(m => m.AdminTurnos),
},
  {
    path: 'medico',
    canActivate: [authGuard],
    data: { rol: 'Medico' },
    loadComponent: () =>
      import('./pages/medico/medico').then(m => m.Medico),
  },
  {
    path: 'paciente',
    canActivate: [authGuard],
    data: { rol: 'Paciente' },
    loadComponent: () =>
      import('./pages/paciente/paciente').then(m => m.Paciente),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];