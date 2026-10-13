import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Medicos } from '../../services/medicos';

@Component({
  selector: 'app-completar-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './completar-perfil.html',
  styleUrl: './completar-perfil.css',
})
export class CompletarPerfil {
  matricula: number | null = null;
  valorConsulta: number | null = null;

  mensaje = '';
  cargando = false;

  constructor(
    private readonly medicosService: Medicos,
    private readonly router: Router,
  ) {}

  guardarPerfil(): void {
    this.mensaje = '';

    if (
      this.matricula === null ||
      this.matricula <= 0 ||
      this.valorConsulta === null ||
      this.valorConsulta <= 0
    ) {
      this.mensaje =
        'Ingresá una matrícula y un valor de consulta válidos.';
      return;
    }

    if (this.cargando) {
      return;
    }

    this.cargando = true;

    this.medicosService
      .completarPerfil(
        this.matricula,
        this.valorConsulta,
      )
      .subscribe({
        next: () => {
          this.cargando = false;
          void this.router.navigate(['/medico']);
        },
        error: (error) => {
          this.cargando = false;

          if (error.status === 409 || error.status === 400) {
            this.mensaje =
              typeof error.error?.message === 'string'
                ? error.error.message
                : 'No se pudo registrar el perfil. Verificá los datos.';
          } else if (error.status === 0) {
            this.mensaje =
              'No se pudo conectar con el servidor.';
          } else {
            this.mensaje =
              'Ocurrió un error al guardar el perfil.';
          }

          console.error(
            'Error al completar el perfil:',
            error,
          );
        },
      });
  }
}