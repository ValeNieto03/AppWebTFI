import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerfilMedico {
  id: number;
  matricula: number;
  valor_consulta: number;
}

@Injectable({
  providedIn: 'root',
})
export class Medicos {
  private readonly apiUrl = '/api/v1/medicos';

  constructor(private readonly http: HttpClient) {}

  private obtenerHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  obtenerPerfil(): Observable<PerfilMedico | null> {
    return this.http.get<PerfilMedico | null>(
      `${this.apiUrl}/mi-perfil`,
      { headers: this.obtenerHeaders() },
    );
  }

  completarPerfil(
    matricula: number,
    valor_consulta: number,
  ): Observable<PerfilMedico> {
    return this.http.post<PerfilMedico>(
      this.apiUrl,
      { matricula, valor_consulta },
      { headers: this.obtenerHeaders() },
    );
  }
}