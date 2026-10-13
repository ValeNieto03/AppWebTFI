
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface UsuarioSesion {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
}

export interface LoginRespuesta {
    mensaje: string;
    token?: string;
    usuario?: UsuarioSesion;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly apiUrl =
        'http://localhost:3000/api/v1/auth';

    private temporizadorExpiracion:
        ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
    ) {
        // Si ya existe una sesión, comprobar su vencimiento.
        this.programarExpiracionSesion();
    }

    login(
        email: string,
        clave: string,
    ): Observable<LoginRespuesta> {
        return this.http
            .post<LoginRespuesta>(
                `${this.apiUrl}/login`,
                { email, clave },
            )
            .pipe(
                tap((respuesta) => {
                    if (
                        respuesta.mensaje === 'Login correcto' &&
                        respuesta.token &&
                        respuesta.usuario
                    ) {
                        localStorage.setItem(
                            'token',
                            respuesta.token,
                        );

                        localStorage.setItem(
                            'usuario',
                            JSON.stringify(respuesta.usuario),
                        );

                        this.programarExpiracionSesion();
                    }
                }),
            );
    }

    private programarExpiracionSesion(): void {
        if (this.temporizadorExpiracion !== undefined) {
            clearTimeout(this.temporizadorExpiracion);
            this.temporizadorExpiracion = undefined;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        try {
            const partes = token.split('.');
            if (partes.length !== 3) {
                this.cerrarSesionPorExpiracion();
                return;
            }

            // Leer la fecha de vencimiento del JWT.
            const payloadBase64 = partes[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const payload = JSON.parse(
                atob(payloadBase64),
            );

            const expiracion = Number(payload.exp);

            if (!Number.isFinite(expiracion)) {
                // Sin fecha de vencimiento válida no podemos
                // programar un cierre automático confiable.
                return;
            }

            const milisegundosRestantes =
                expiracion * 1000 - Date.now();

            if (milisegundosRestantes <= 0) {
                this.cerrarSesionPorExpiracion();
                return;
            }

            this.temporizadorExpiracion = setTimeout(
                () => this.cerrarSesionPorExpiracion(),
                milisegundosRestantes,
            );
        } catch (error) {
            console.error(
                'No se pudo comprobar la expiración de la sesión:',
                error,
            );
        }
    }

    private cerrarSesionPorExpiracion(): void {
        this.logout();

        // Evitar redirecciones repetidas si ya estamos
        // en la pantalla de inicio de sesión.
        if (this.router.url !== '/login') {
            void this.router.navigate(['/login'], {
                queryParams: { sesionExpirada: 'true' },
            });
        }
    }

    logout(): void {
        if (this.temporizadorExpiracion !== undefined) {
            clearTimeout(this.temporizadorExpiracion);
            this.temporizadorExpiracion = undefined;
        }

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }
}
