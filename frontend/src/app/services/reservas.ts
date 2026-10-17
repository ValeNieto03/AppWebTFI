
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export type EstadoSolicitadoCorreccion = 'ATENDIDO' | 'AUSENTE';

export interface SolicitudCorreccionReserva {
    id: number;
    id_reserva: number;
    id_medico: number;
    estado_actual: string;
    estado_solicitado: EstadoSolicitadoCorreccion;
    motivo: string;
    estado_solicitud: 'Pendiente' | 'Aprobada' | 'Rechazada';
    id_administrador: number | null;
    respuesta_admin: string | null;
    fecha_solicitud: string;
    fecha_resolucion: string | null;
}

export interface SolicitarCorreccionRespuesta {
    mensaje: string;
    solicitud: SolicitudCorreccionReserva;
}

@Injectable({
    providedIn: 'root',
})
export class ReservasService {
    private readonly apiUrl =
        'http://localhost:3000/api/v1/reservas';

    private readonly medicosUrl =
        'http://localhost:3000/api/v1/medicos';

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
        estado: 'ATENDIDO' | 'AUSENTE',
    ): Observable<CambiarEstadoReservaRespuesta> {
        return this.http.patch<CambiarEstadoReservaRespuesta>(
            `${this.apiUrl}/${id}/estado`,
            { estado },
            { headers: this.obtenerHeaders() },
        );
    }

    solicitarCorreccionTurno(
        idReserva: number,
        estadoSolicitado: EstadoSolicitadoCorreccion,
        motivo: string,
    ): Observable<SolicitarCorreccionRespuesta> {
        return this.http.post<SolicitarCorreccionRespuesta>(
            `${this.apiUrl}/solicitudes-correccion`,
            {
                id_reserva: idReserva,
                estado_solicitado: estadoSolicitado,
                motivo: motivo.trim(),
            },
            { headers: this.obtenerHeaders() },
        );
    }
}
