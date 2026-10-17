
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';
import {
  Reserva,
  ReservasService,
  EstadoSolicitadoCorreccion,
} from '../../services/reservas';

type PestanaReservas =
  | 'todas'
  | 'activo'
  | 'atendido'
  | 'ausente'
  | 'cancelado';

interface ModalConfirmacionMedico {
  reserva: Reserva;
  estado: 'ATENDIDO' | 'AUSENTE';
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
}

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medico.html',
  styleUrl: './medico.css',
})
export class Medico implements OnInit {
  // Turnos y mensajes generales.
  reservas = signal<Reserva[]>([]);
  cargando = signal(false);
  actualizandoId = signal<number | null>(null);
  error = signal('');
  mensaje = signal('');
  mostrarImporte = signal(false);

  // Filtros y ordenamiento.
  pestanaActiva = signal<PestanaReservas>('activo');
  ordenFecha = signal<'desc' | 'asc'>('desc');
  fechaSeleccionada = '';

  // Modal personalizado para cambiar el estado de un turno.
  modalConfirmacion =
    signal<ModalConfirmacionMedico | null>(null);

  procesandoConfirmacion = signal(false);

  // Solicitudes de corrección.
  reservaEnCorreccion = signal<number | null>(null);
  estadoSolicitado: EstadoSolicitadoCorreccion = 'ATENDIDO';
  motivoCorreccion = '';
  enviandoCorreccion = signal(false);

  // Ordena los turnos por fecha.
  reservasOrdenadas = computed(() => {
    const direccion = this.ordenFecha();

    return [...this.reservas()].sort((a, b) => {
      const fechaA = new Date(a.fecha_hora).getTime();
      const fechaB = new Date(b.fecha_hora).getTime();

      if (
        Number.isNaN(fechaA) ||
        Number.isNaN(fechaB)
      ) {
        return 0;
      }

      return direccion === 'desc'
        ? fechaB - fechaA
        : fechaA - fechaB;
    });
  });

  // Filtra los turnos según la pestaña seleccionada.
  reservasFiltradas = computed(() => {
    const pestana = this.pestanaActiva();
    const reservas = this.reservasOrdenadas();

    if (pestana === 'todas') {
      return reservas;
    }

    return reservas.filter(
      (reserva) =>
        reserva.estado.trim().toLowerCase() === pestana,
    );
  });

  constructor(
    private readonly authService: AuthService,
    private readonly reservasService: ReservasService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  // Obtiene los turnos del médico.
  cargarTurnos(): void {
    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    const fecha =
      this.fechaSeleccionada.trim() || undefined;

    this.reservasService
      .obtenerTurnosMedico(fecha)
      .subscribe({
        next: (respuesta) => {
          this.reservas.set(respuesta.reservas ?? []);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error(
            'Error al cargar turnos del médico:',
            err,
          );

          this.reservas.set([]);
          this.cargando.set(false);

          if (
            err.status === 401 ||
            err.status === 403
          ) {
            this.error.set(
              'No tenés permiso para consultar estos turnos. Verificá tu sesión.',
            );
          } else {
            this.error.set(
              'No se pudieron cargar los turnos. Verificá que el backend esté funcionando.',
            );
          }
        },
      });
  }

  // Quita el filtro de fecha.
  limpiarFiltro(): void {
    this.fechaSeleccionada = '';
    this.cargarTurnos();
  }

  // Abre el modal personalizado de confirmación.
  cambiarEstado(
    reserva: Reserva,
    estado: 'ATENDIDO' | 'AUSENTE',
  ): void {
    if (
      reserva.estado.trim().toLowerCase() !== 'activo' ||
      this.actualizandoId() !== null ||
      this.procesandoConfirmacion()
    ) {
      return;
    }

    const esAtendido = estado === 'ATENDIDO';

    this.modalConfirmacion.set({
      reserva,
      estado,
      titulo: esAtendido
        ? 'Marcar turno como atendido'
        : 'Marcar turno como ausente',
      mensaje: esAtendido
        ? '¿Confirmás que el paciente fue atendido en esta consulta?'
        : '¿Confirmás que el paciente estuvo ausente en este turno?',
      textoConfirmar: esAtendido
        ? 'Sí, marcar atendido'
        : 'Sí, marcar ausente',
    });

    this.error.set('');
    this.mensaje.set('');
  }

  // Cierra el modal si no hay una operación en curso.
  cerrarModalConfirmacion(): void {
    if (this.procesandoConfirmacion()) {
      return;
    }

    this.modalConfirmacion.set(null);
  }

  // Cambia el estado únicamente después de confirmar.
  confirmarCambioEstado(): void {
    const modal = this.modalConfirmacion();

    if (
      !modal ||
      this.procesandoConfirmacion()
    ) {
      return;
    }

    // Verifica que el turno siga activo.
    if (
      modal.reserva.estado.trim().toLowerCase() !== 'activo' ||
      this.actualizandoId() !== null
    ) {
      this.modalConfirmacion.set(null);
      this.error.set(
        'Este turno ya no está activo y no se puede modificar.',
      );
      return;
    }

    this.procesandoConfirmacion.set(true);
    this.actualizandoId.set(modal.reserva.id);
    this.error.set('');
    this.mensaje.set('');

    this.reservasService
      .cambiarEstadoTurno(
        modal.reserva.id,
        modal.estado,
      )
      .subscribe({
        next: () => {
          this.procesandoConfirmacion.set(false);
          this.actualizandoId.set(null);
          this.modalConfirmacion.set(null);

          // Recarga los turnos y después muestra el mensaje.
          this.cargarTurnos();

          this.mensaje.set(
            modal.estado === 'ATENDIDO'
              ? 'El turno se marcó como atendido.'
              : 'El turno se marcó como ausente.',
          );
        },
        error: (err) => {
          console.error(
            'Error al cambiar estado del turno:',
            err,
          );

          this.procesandoConfirmacion.set(false);
          this.actualizandoId.set(null);
          this.modalConfirmacion.set(null);

          this.error.set(
            err.error?.message ??
            'No se pudo actualizar el estado del turno.',
          );
        },
      });
  }

  // Abre el formulario para solicitar una corrección.
  abrirFormularioCorreccion(
    reserva: Reserva,
  ): void {
    const estado = reserva.estado.trim().toLowerCase();

    if (
      estado !== 'atendido' &&
      estado !== 'ausente'
    ) {
      return;
    }

    this.reservaEnCorreccion.set(reserva.id);

    this.estadoSolicitado =
      estado === 'atendido'
        ? 'AUSENTE'
        : 'ATENDIDO';

    this.motivoCorreccion = '';
    this.error.set('');
    this.mensaje.set('');
  }

  // Cierra el formulario de corrección.
  cerrarFormularioCorreccion(): void {
    if (this.enviandoCorreccion()) {
      return;
    }

    this.reservaEnCorreccion.set(null);
    this.motivoCorreccion = '';
  }

  // Envía la solicitud de corrección al backend.
  enviarSolicitudCorreccion(
    reserva: Reserva,
  ): void {
    const motivo = this.motivoCorreccion.trim();

    if (this.enviandoCorreccion()) {
      return;
    }

    if (motivo.length === 0) {
      this.error.set(
        'Tenés que indicar el motivo de la corrección.',
      );
      return;
    }

    if (motivo.length > 1000) {
      this.error.set(
        'El motivo no puede superar los 1000 caracteres.',
      );
      return;
    }

    const estadoActual =
      reserva.estado.trim().toLowerCase();

    if (
      estadoActual !== 'atendido' &&
      estadoActual !== 'ausente'
    ) {
      this.error.set(
        'Solo se pueden solicitar correcciones de turnos atendidos o ausentes.',
      );
      return;
    }

    if (
      this.estadoSolicitado.toLowerCase() ===
      estadoActual
    ) {
      this.error.set(
        'El estado solicitado debe ser diferente del estado actual.',
      );
      return;
    }

    this.error.set('');
    this.mensaje.set('');
    this.enviandoCorreccion.set(true);

    this.reservasService
      .solicitarCorreccionTurno(
        reserva.id,
        this.estadoSolicitado,
        motivo,
      )
      .subscribe({
        next: (respuesta) => {
          this.enviandoCorreccion.set(false);
          this.reservaEnCorreccion.set(null);
          this.motivoCorreccion = '';

          this.mensaje.set(
            respuesta.mensaje ||
            'La solicitud de corrección fue enviada al administrador.',
          );
        },
        error: (err) => {
          console.error(
            'Error al solicitar corrección:',
            err,
          );

          this.enviandoCorreccion.set(false);

          this.error.set(
            err.error?.message ??
            'No se pudo enviar la solicitud de corrección.',
          );
        },
      });
  }

  // Cuenta los turnos que tienen un estado determinado.
  contarPorEstado(
    estadoBuscado: string,
  ): number {
    return this.reservas().filter(
      (reserva) =>
        reserva.estado.trim().toLowerCase() ===
        estadoBuscado.trim().toLowerCase(),
    ).length;
  }

  // Calcula el total de las consultas atendidas.
  calcularImporteAtendido(): number {
    return this.reservas()
      .filter(
        (reserva) =>
          reserva.estado.trim().toLowerCase() ===
          'atendido',
      )
      .reduce(
        (total, reserva) =>
          total +
          Number(reserva.valor_consulta || 0),
        0,
      );
  }

  // Formatea la fecha y hora del turno.
  formatearFecha(fecha: string): string {
    const fechaConsulta = new Date(fecha);

    if (
      Number.isNaN(fechaConsulta.getTime())
    ) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(fechaConsulta);
  }

  // Cierra la sesión y vuelve al login.
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
