import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.sesionValida()) {
        authService.logout();
        return router.createUrlTree(['/login']);
    }

    const usuario = authService.obtenerUsuario();

    if (!usuario) {
        authService.logout();
        return router.createUrlTree(['/login']);
    }

    const rolPermitido = route.data['rol'];

    if (usuario.rol !== rolPermitido) {
        const rutasPorRol: Record<string, string> = {
            Administrador: '/admin',
            Medico: '/medico',
            Paciente: '/paciente',
        };

        const rutaCorrecta = rutasPorRol[usuario.rol];

        return router.createUrlTree([
            rutaCorrecta ?? '/login',
        ]);
    }

    return true;
};