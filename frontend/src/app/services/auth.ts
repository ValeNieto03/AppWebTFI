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

    private readonly apiUrl =
        'http://localhost:3000/api/v1/auth';

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
}
