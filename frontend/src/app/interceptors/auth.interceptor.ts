
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error) => {
      const esLogin =
        request.url.includes('/auth/login');

      if (
        error.status === 401 &&
        !esLogin &&
        localStorage.getItem('token')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        if (router.url !== '/login') {
          void router.navigate(['/login'], {
            queryParams: {
              sesionExpirada: 'true',
            },
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
