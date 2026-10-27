import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Pantalla de inicio de cada rol.
const inicioPorRol: Record<string, string> = {
  ADMINISTRADOR: '/admin',
  MEDICO: '/medico',
  PACIENTE: '/paciente',
};

// Deja entrar a la ruta solo si hay sesión y el rol del usuario
// está en data.roles. La seguridad real la controla el backend;
// este guard solo evita mostrar pantallas que no corresponden.
export const rolGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!token || !usuarioGuardado) {
    return router.createUrlTree(['/login']);
  }

  let rol: string | undefined;

  try {
    rol = JSON.parse(usuarioGuardado).rol;
  } catch {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data['roles'] as string[];

  if (rol && rolesPermitidos.includes(rol)) {
    return true;
  }

  // Tiene sesión pero con otro rol: lo mandamos a su propia pantalla.
  const inicio = rol ? inicioPorRol[rol] : undefined;

  return router.createUrlTree([inicio ?? '/login']);
};
