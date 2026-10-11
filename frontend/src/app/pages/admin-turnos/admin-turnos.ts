
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  ReservasService,
  ReservaAdmin,
} from '../../services/reservas';

@Component({
  selector: 'app-admin-turnos',
  imports: [CommonModule],
  templateUrl: './admin-turnos.html',
  styleUrl: './admin-turnos.css',
})
export class AdminTurnos implements OnInit {

  private readonly reservasService = inject(ReservasService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  reservas: ReservaAdmin[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.markForCheck();

    this.reservasService.obtenerReservasAdmin().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.error = 'No se pudieron cargar las reservas.';
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  get cantidadActivos(): number {
    return this.reservas.filter(
      reserva => reserva.estado.toUpperCase() === 'ACTIVO'
    ).length;
  }

  get cantidadCancelados(): number {
    return this.reservas.filter(
      reserva => reserva.estado.toUpperCase() === 'CANCELADO'
    ).length;
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }
}
