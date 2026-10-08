import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },

    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login').then(
                (m) => m.Login,
            ),
    },

    {
        path: 'admin',
        loadComponent: () =>
            import('./pages/admin/admin').then(
                (m) => m.Admin,
            ),
    },

    {
        path: 'paciente',
        loadComponent: () =>
            import('./pages/paciente/paciente').then(
                (m) => m.Paciente,
            ),
    },

    {
        path: 'medico',
        loadComponent: () =>
            import('./pages/medico/medico').then(
                (m) => m.Medico,
            ),
    },
];