
import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicoReserva {
    id: number;
    nombre: string;
    documento?: string;
    email?: string;
    matricula: number;
    valor_consulta: number;
    estado?: string;
}

export interface PacienteReserva {
    id: number;
    nombre: string;
    documento?: string;
    email?: string;
}

export interface Reserva {
    id: number;
    fecha_hora: string;
    estado: string;
    valor_consulta: number;
    paciente?: PacienteReserva | null;
    medico?: MedicoReserva | null;
}

export type ReservaAdmin = Reserva

export interface ListadoReservasRespuesta {
    mensaje?: string;
    reservas: Reserva[];
}

export interface CambiarEstadoReservaRespuesta {
    id: number;
    fecha_hora: string;
    estado: string;
    valor_consulta: number;
}

export interface CrearReservaRespuesta {
    mensaje: string;
    reserva: {
        id: number;
        fecha_hora: string;
        estado: string;
        valor_consulta: number;
        medico: string | null;
        paciente: string;
    };
}

export interface CrearReservaDatos {
    id_medico: number;
    fecha_hora: string;
}

export interface CrearReservaAdminDatos extends CrearReservaDatos {
    id_paciente: number;
}

export interface CancelarReservaRespuesta {
    mensaje: string;
    reserva: {
        id: number;
        fecha_hora: string;
        estado: string;
        valor_consulta: number;
    };
}

export interface ModificarValorRespuesta {
    mensaje: string;
    medico: {
        id: number;
        valor_consulta: number;
    };
}

export type EstadoReservaMedico = 'ATENDIDO' | 'AUSENTE';

@Injectable({
    providedIn: 'root',
})
export class ReservasService {
    private readonly apiUrl =
        '/api/v1/reservas';

    private readonly medicosUrl =
        '/api/v1/medicos';

    constructor(
        private readonly http: HttpClient,
    ) { }

    private obtenerHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');

        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`,
        });
    }

    // ==========================================
    // FUNCIONES DEL PACIENTE
    // ==========================================

    obtenerMisTurnos(): Observable<ListadoReservasRespuesta> {
        return this.http.get<ListadoReservasRespuesta>(
            this.apiUrl,
            { headers: this.obtenerHeaders() },
        );
    }

    obtenerMedicos(): Observable<MedicoReserva[]> {
        return this.http.get<MedicoReserva[]>(
            this.medicosUrl,
            { headers: this.obtenerHeaders() },
        );
    }

    crearReserva(
        datos: CrearReservaDatos,
    ): Observable<CrearReservaRespuesta> {
        return this.http.post<CrearReservaRespuesta>(
            this.apiUrl,
            datos,
            { headers: this.obtenerHeaders() },
        );
    }

    cancelarTurno(id: number): Observable<unknown> {
        return this.http.patch<unknown>(
            `${this.apiUrl}/${id}/cancelar`,
            {},
            { headers: this.obtenerHeaders() },
        );
    }

    // ==========================================
    // FUNCIONES DEL MÉDICO
    // ==========================================

    obtenerTurnosMedico(
        fecha?: string,
    ): Observable<ListadoReservasRespuesta> {
        const headers = this.obtenerHeaders();

        if (fecha) {
            const params = new HttpParams().set('fecha', fecha);

            return this.http.get<ListadoReservasRespuesta>(
                `${this.apiUrl}/medico`,
                { headers, params },
            );
        }

        return this.http.get<ListadoReservasRespuesta>(
            `${this.apiUrl}/medico`,
            { headers },
        );
    }

    cambiarEstadoTurno(
        id: number,
        estado: EstadoReservaMedico,
    ): Observable<CambiarEstadoReservaRespuesta> {
        return this.http.patch<CambiarEstadoReservaRespuesta>(
            `${this.apiUrl}/${id}/estado`,
            { estado },
            { headers: this.obtenerHeaders() },
        );
    }

    // ==========================================
    // FUNCIONES DEL ADMINISTRADOR
    // ==========================================

    obtenerReservasAdmin(): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(
            `${this.apiUrl}/admin`,
            { headers: this.obtenerHeaders() },
        );
    }

    crearReservaAdmin(
        datos: CrearReservaAdminDatos,
    ): Observable<CrearReservaRespuesta> {
        return this.http.post<CrearReservaRespuesta>(
            this.apiUrl,
            datos,
            { headers: this.obtenerHeaders() },
        );
    }

    cancelarReservaAdmin(
        id: number,
    ): Observable<CancelarReservaRespuesta> {
        return this.http.patch<CancelarReservaRespuesta>(
            `${this.apiUrl}/admin/${id}/cancelar`,
            {},
            { headers: this.obtenerHeaders() },
        );
    }

    modificarValorConsulta(
        idMedico: number,
        valorConsulta: number,
    ): Observable<ModificarValorRespuesta> {
        return this.http.patch<ModificarValorRespuesta>(
            `${this.medicosUrl}/${idMedico}/valor`,
            { valor_consulta: valorConsulta },
            { headers: this.obtenerHeaders() },
        );
    }
}
