import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ReservaAdmin {
  id: number;
  fecha_hora: string;
  estado: string;
  valor_consulta: number;
  paciente: {
    id: number;
    nombre: string;
    documento: string;
    email: string;
  } | null;
  medico: {
    id: number;
    nombre: string | null;
    documento: string | null;
    email: string | null;
    matricula: string;
    valor_consulta: number;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/v1/reservas';

  obtenerReservasAdmin(): Observable<ReservaAdmin[]> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(() => new Error('No hay sesión activa'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<ReservaAdmin[]>(
      `${this.apiUrl}/admin`,
      { headers },
    );
  }
}