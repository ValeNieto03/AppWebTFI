import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Medicos } from '../services/medicos';

export const perfilMedicoGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const medicosService = inject(Medicos);

  const token = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!token || !usuarioGuardado) {
    return true;
  }

  let usuario: { rol?: string };

  try {
    usuario = JSON.parse(usuarioGuardado);
  } catch {
    return router.createUrlTree(['/login']);
  }

  const estaEnCompletarPerfil =
    route.routeConfig?.path === 'completar-perfil';

  if (usuario.rol !== 'MEDICO') {
    if (estaEnCompletarPerfil) {
      if (usuario.rol === 'ADMINISTRADOR') {
        return router.createUrlTree(['/admin']);
      }

      if (usuario.rol === 'PACIENTE') {
        return router.createUrlTree(['/paciente']);
      }

      return router.createUrlTree(['/login']);
    }

    return true;
  }

  return medicosService.obtenerPerfil().pipe(
    map((perfil) => {
      if (!perfil) {
        return estaEnCompletarPerfil
          ? true
          : router.createUrlTree(['/completar-perfil']);
      }

      if (estaEnCompletarPerfil) {
        return router.createUrlTree(['/medico']);
      }

      return true;
    }),
    catchError((error) => {
      console.error(
        'No se pudo comprobar el perfil médico:',
        error,
      );

      if (estaEnCompletarPerfil) {
        return of(false);
      }

      return of(router.createUrlTree(['/login']));
    }),
  );
};
