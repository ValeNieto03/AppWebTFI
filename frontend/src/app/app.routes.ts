
import { Routes } from '@angular/router';
import { perfilMedicoGuard } from './guards/perfil-medico-guard';

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
    canActivate: [perfilMedicoGuard],
    loadComponent: () =>
      import('./pages/admin/admin').then((m) => m.Admin),
  },
  {
    path: 'paciente',
    canActivate: [perfilMedicoGuard],
    loadComponent: () =>
      import('./pages/paciente/paciente').then((m) => m.Paciente),
  },
  {
    path: 'completar-perfil',
    canActivate: [perfilMedicoGuard],
    loadComponent: () =>
      import('./pages/completar-perfil/completar-perfil').then(
        (m) => m.CompletarPerfil,
      ),
  },
  {
    path: 'medico',
    canActivate: [perfilMedicoGuard],
    loadComponent: () =>
      import('./pages/medico/medico').then((m) => m.Medico),
  },
];