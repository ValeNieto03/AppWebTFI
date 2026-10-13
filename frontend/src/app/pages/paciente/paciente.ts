
import {
  Component,
  OnInit,
  LOCALE_ID,
  signal,
  ChangeDetectorRef,
} from '@angular/core';

import {
  CommonModule,
  registerLocaleData,
} from '@angular/common';

import localeEsAr from '@angular/common/locales/es-AR';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

import {
  Reserva,
  MedicoReserva,
  ReservasService,
} from '../../services/reservas';

registerLocaleData(localeEsAr);

type TipoModal = 'confirmacion' | 'exito' | 'error';

type AccionModal = 'cerrarSesion' | 'cancelarTurno' | null;

interface ModalPaciente {
  tipo: TipoModal;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  accion?: AccionModal;
  idReserva?: number;
}

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente.html',
  styleUrl: './paciente.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'es-AR' },
  ],
})
export class Paciente implements OnInit {
  reservas = signal<Reserva[]>([]);
  cargando = signal(false);
  error = signal('');

  medicos = signal<MedicoReserva[]>([]);
  cargandoMedicos = signal(false);
  errorMedicos = signal('');

  medicoSeleccionado = signal('');
  fechaSeleccionada = signal('');
  horaSeleccionada = signal('');

  creandoReserva = signal(false);
  mensajeFormulario = signal('');
  errorFormulario = signal('');

  // Ventana emergente reutilizable.
  modal = signal<ModalPaciente | null>(null);
  procesandoModal = signal(false);

  readonly fechaMinima = this.obtenerFechaActual();
  readonly fechaMaxima = this.obtenerFechaMaxima();

  readonly horariosDisponibles = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly reservasService: ReservasService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.cargarMisTurnos();
    this.cargarMedicos();
  }

  obtenerFechaActual(): string {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  obtenerFechaMaxima(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.errorMedicos.set('');

    this.reservasService.obtenerMedicos().subscribe({
      next: (respuesta) => {
        const medicosActivos = (respuesta ?? []).filter(
          (medico) =>
            this.normalizarEstado(medico.estado ?? '') === 'activo',
        );

        this.medicos.set(medicosActivos);
        this.cargandoMedicos.set(false);
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar médicos:', err);

        this.cargandoMedicos.set(false);
        this.errorMedicos.set(
          'No se pudo cargar la lista de médicos. Intentá nuevamente.',
        );

        this.cdr.detectChanges();
      },
    });
  }

  obtenerMedicoSeleccionado(): MedicoReserva | undefined {
    return this.medicos().find(
      (medico) => String(medico.id) === this.medicoSeleccionado(),
    );
  }

  cargarMisTurnos(): void {
    this.cargando.set(true);
    this.error.set('');

    this.reservasService.obtenerMisTurnos().subscribe({
      next: (respuesta) => {
        this.reservas.set(respuesta.reservas ?? []);
        this.cargando.set(false);
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.cargando.set(false);

        if (err.status === 401 || err.status === 403) {
          this.error.set(
            'Tu sesión no es válida o no tenés permiso para consultar estos turnos.',
          );
        } else {
          this.error.set(
            'No se pudieron cargar los turnos. Verificá que el backend esté funcionando.',
          );
        }

        console.error('Error al cargar turnos:', err);
        this.cdr.detectChanges();
      },
    });
  }

  crearReserva(): void {
    this.errorFormulario.set('');
    this.mensajeFormulario.set('');

    const idMedico = Number(this.medicoSeleccionado());
    const fecha = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();

    if (!idMedico || !fecha || !hora) {
      this.errorFormulario.set(
        'Completá el médico, la fecha y el horario para continuar.',
      );
      return;
    }

    if (fecha < this.fechaMinima || fecha > this.fechaMaxima) {
      this.errorFormulario.set(
        'Elegí una fecha dentro de los próximos 30 días.',
      );
      return;
    }

    if (!this.horariosDisponibles.includes(hora)) {
      this.errorFormulario.set(
        'Elegí uno de los horarios disponibles.',
      );
      return;
    }

    const [anio, mes, dia] = fecha.split('-');
    const fechaHora = `${dia}/${mes}/${anio} ${hora}`;

    this.creandoReserva.set(true);

    this.reservasService.crearReserva({
      id_medico: idMedico,
      fecha_hora: fechaHora,
    }).subscribe({
      next: (respuesta) => {
        this.creandoReserva.set(false);

        this.mensajeFormulario.set(
          respuesta.mensaje || 'El turno se reservó correctamente.',
        );

        this.medicoSeleccionado.set('');
        this.fechaSeleccionada.set('');
        this.horaSeleccionada.set('');

        this.cargarMisTurnos();

        this.abrirModal({
          tipo: 'exito',
          titulo: '¡Turno reservado!',
          mensaje:
            respuesta.mensaje ||
            'Tu turno se reservó correctamente.',
        });

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al crear la reserva:', err);

        this.creandoReserva.set(false);

        const mensaje = err.error?.message;

        const mensajeError = Array.isArray(mensaje)
          ? mensaje.join(' ')
          : typeof mensaje === 'string'
            ? mensaje
            : 'No se pudo reservar el turno. Intentá nuevamente.';

        this.errorFormulario.set(mensajeError);

        this.abrirModal({
          tipo: 'error',
          titulo: 'No se pudo reservar',
          mensaje: mensajeError,
        });

        this.cdr.detectChanges();
      },
    });
  }

  contarPorEstado(estadoBuscado: string): number {
    return this.reservas().filter(
      (reserva) =>
        this.normalizarEstado(reserva.estado) ===
        this.normalizarEstado(estadoBuscado),
    ).length;
  }

  normalizarEstado(estado: string): string {
    return (estado ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  formatearFecha(fecha: string): string {
    const fechaConsulta = new Date(fecha);

    if (Number.isNaN(fechaConsulta.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(fechaConsulta);
  }

  // Abre la ventana para confirmar la cancelación.
  cancelarTurno(reserva: Reserva): void {
    this.abrirModal({
      tipo: 'confirmacion',
      titulo: '¿Cancelar turno?',
      mensaje:
        `¿Querés cancelar el turno con ${reserva.medico?.nombre ?? 'el médico'}? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, cancelar turno',
      accion: 'cancelarTurno',
      idReserva: reserva.id,
    });
  }

  // Abre la ventana para confirmar el cierre de sesión.
  cerrarSesion(): void {
    this.abrirModal({
      tipo: 'confirmacion',
      titulo: '¿Cerrar sesión?',
      mensaje: 'Vas a salir del portal del paciente. ¿Querés continuar?',
      textoConfirmar: 'Cerrar sesión',
      accion: 'cerrarSesion',
    });
  }

  private abrirModal(datos: ModalPaciente): void {
    this.modal.set(datos);
  }

  cerrarModal(): void {
    if (this.procesandoModal()) {
      return;
    }

    this.modal.set(null);
  }

  // Ejecuta la acción únicamente si el usuario confirma.
  confirmarModal(): void {
    const modalActual = this.modal();

    if (!modalActual || this.procesandoModal()) {
      return;
    }

    if (modalActual.accion === 'cerrarSesion') {
      this.modal.set(null);
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (
      modalActual.accion === 'cancelarTurno' &&
      modalActual.idReserva != null
    ) {
      this.ejecutarCancelacion(modalActual.idReserva);
    }
  }

  private ejecutarCancelacion(idReserva: number): void {
    this.procesandoModal.set(true);

    this.reservasService.cancelarTurno(idReserva).subscribe({
      next: () => {
        this.procesandoModal.set(false);

        this.abrirModal({
          tipo: 'exito',
          titulo: 'Turno cancelado',
          mensaje: 'El turno se canceló correctamente.',
        });

        this.cargarMisTurnos();
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cancelar el turno:', err);

        this.procesandoModal.set(false);

        let mensajeError: string;

        if (err.status === 400 || err.status === 403) {
          const mensajeBackend = err.error?.message;

          mensajeError =
            (typeof mensajeBackend === 'string' && mensajeBackend.trim())
              ? mensajeBackend
              : 'No se puede cancelar este turno. Recordá que solo podés hacerlo hasta el día anterior a la consulta.';
        } else {
          mensajeError =
            'No se pudo cancelar el turno. Intentá nuevamente.';
        }

        this.abrirModal({
          tipo: 'error',
          titulo: 'No se pudo cancelar',
          mensaje: mensajeError,
        });

        this.cdr.detectChanges();
      },
    });
  }
}
