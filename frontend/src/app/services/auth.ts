import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    // Usamos una ruta relativa: Angular la deriva al backend mediante el proxy.
    private readonly apiUrl = '/api/v1/auth';

    constructor(
        private readonly http: HttpClient,
    ) { }

    login(
        email: string,
        clave: string,
    ): Observable<LoginRespuesta> {

        return this.http
            .post<LoginRespuesta>(
                `${this.apiUrl}/login`,
                {
                    email,
                    clave,
                },
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

                    }

                }),
            );

    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }

obtenerUsuario(): UsuarioSesion | null {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
        return null;
    }

    try {
        return JSON.parse(usuarioGuardado) as UsuarioSesion;
    } catch {
        return null;
    }
}

sesionValida(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
        return false;
    }

    try {
        const partes = token.split('.');

        if (partes.length !== 3) {
            return false;
        }

        const base64 = partes[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const payload = JSON.parse(atob(base64));

        if (typeof payload.exp !== 'number') {
            return false;
        }

        const fechaActual = Math.floor(Date.now() / 1000);

        return payload.exp > fechaActual;
    } catch {
        return false;
    }
}

}
