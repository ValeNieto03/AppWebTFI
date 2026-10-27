import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Reserva, ReservasService } from '../../services/reservas';

interface UsuarioApi {
    id: number;
    documento: string;
    nombres: string;
    apellidos: string;
    email: string;
    estado: string;
    rol: string;
}

interface MedicoApi {
    id: number;
    documento: string;
    nombre: string;
    email: string;
    matricula: number;
    valor_consulta: number;
    estado: string;
}

type SeccionAdmin =
    | 'resumen'
    | 'turnos'
    | 'medicos'
    | 'pacientes';

type AccionModalAdmin =
    | { tipo: 'cerrarSesion' }
    | { tipo: 'cancelarReserva'; reserva: Reserva };

interface ModalAdmin {
    titulo: string;
    mensaje: string;
    textoConfirmar: string;
    tipo: 'confirmacion';
    accion: AccionModalAdmin;
}

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin.html',
    styleUrl: './admin.css',
})
export class Admin implements OnInit {
    private readonly apiBase = '/api/v1';

    pacientes = signal<UsuarioApi[]>([]);
    medicos = signal<MedicoApi[]>([]);
    reservas = signal<Reserva[]>([]);

    cargandoPacientes = signal(false);
    cargandoMedicos = signal(false);
    cargandoReservas = signal(false);

    errorPacientes = signal('');
    errorMedicos = signal('');
    errorReservas = signal('');
    errorNuevaReserva = signal('');

    // Mensaje verde que aparece abajo a la derecha después de una operación.
    mensajeExito = signal('');

    creandoReserva = signal(false);
    guardandoValorId = signal<number | null>(null);

    modalAdmin = signal<ModalAdmin | null>(null);
    procesandoAccionModal = signal(false);

    seccionActiva = signal<SeccionAdmin>('resumen');

    // Datos del formulario para reservar un turno.
    nuevaReserva = {
        id_paciente: '',
        id_medico: '',
        fecha: '',
        hora: '',
    };

    // Valor de consulta que se está escribiendo para cada médico (por id).
    valoresEditados: Record<number, number> = {};

    readonly fechaMinima = this.formatearFechaInput(new Date());
    readonly fechaMaxima = this.obtenerFechaMaxima();

    // Turnos de una hora entre las 8 y las 16.
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

    // Turnos ordenados del más nuevo al más viejo.
    reservasOrdenadas = computed(() =>
        [...this.reservas()].sort(
            (a, b) =>
                new Date(b.fecha_hora).getTime() -
                new Date(a.fecha_hora).getTime(),
        ),
    );

    constructor(
        private readonly authService: AuthService,
        private readonly reservasService: ReservasService,
        private readonly router: Router,
        private readonly http: HttpClient,
    ) { }

    ngOnInit(): void {
        this.cargarPacientes();
        this.cargarMedicos();
        this.cargarReservas();
    }

    private obtenerHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');

        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`,
        });
    }

    private obtenerMensajeError(
        error: any,
        mensajePredeterminado: string,
    ): string {
        const mensaje = error?.error?.message;

        if (Array.isArray(mensaje)) {
            return mensaje.join('. ');
        }

        return typeof mensaje === 'string' && mensaje.trim()
            ? mensaje
            : mensajePredeterminado;
    }

    private formatearFechaInput(fecha: Date): string {
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }

    private obtenerFechaMaxima(): string {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 30);

        return this.formatearFechaInput(fecha);
    }

    private abrirConfirmacion(
        titulo: string,
        mensaje: string,
        textoConfirmar: string,
        accion: AccionModalAdmin,
    ): void {
        this.modalAdmin.set({
            titulo,
            mensaje,
            textoConfirmar,
            tipo: 'confirmacion',
            accion,
        });
    }

    cerrarModalAdmin(): void {
        if (this.procesandoAccionModal()) {
            return;
        }

        this.modalAdmin.set(null);
    }

    modalEsPeligroso(modal: ModalAdmin): boolean {
        return (
            modal.accion.tipo === 'cerrarSesion' ||
            modal.accion.tipo === 'cancelarReserva'
        );
    }

    confirmarAccionModal(): void {
        const modal = this.modalAdmin();

        if (
            !modal ||
            this.procesandoAccionModal()
        ) {
            return;
        }

        switch (modal.accion.tipo) {
            case 'cerrarSesion':
                this.modalAdmin.set(null);
                this.authService.logout();
                this.router.navigate(['/login']);
                break;

            case 'cancelarReserva':
                this.ejecutarCancelacion(modal.accion.reserva);
                break;
        }
    }

    cambiarSeccion(seccion: SeccionAdmin): void {
        this.seccionActiva.set(seccion);
        this.errorPacientes.set('');
        this.errorMedicos.set('');
        this.errorReservas.set('');
        this.errorNuevaReserva.set('');
    }

    cargarPacientes(): void {
        this.cargandoPacientes.set(true);
        this.errorPacientes.set('');

        this.http
            .get<UsuarioApi[] | { pacientes: UsuarioApi[] }>(
                `${this.apiBase}/pacientes`,
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: (respuesta) => {
                    const lista = Array.isArray(respuesta)
                        ? respuesta
                        : respuesta.pacientes ?? [];

                    this.pacientes.set(lista);
                    this.cargandoPacientes.set(false);
                },
                error: (error) => {
                    console.error('Error al cargar pacientes:', error);
                    this.errorPacientes.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudieron cargar los pacientes.',
                        ),
                    );
                    this.cargandoPacientes.set(false);
                },
            });
    }

    cargarMedicos(): void {
        this.cargandoMedicos.set(true);
        this.errorMedicos.set('');

        this.http
            .get<MedicoApi[] | { medicos: MedicoApi[] }>(
                `${this.apiBase}/medicos`,
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: (respuesta) => {
                    const lista = Array.isArray(respuesta)
                        ? respuesta
                        : respuesta.medicos ?? [];

                    // Cada campo de valor arranca con el valor actual del médico.
                    this.valoresEditados = {};

                    for (const medico of lista) {
                        this.valoresEditados[medico.id] =
                            Number(medico.valor_consulta);
                    }

                    this.medicos.set(lista);
                    this.cargandoMedicos.set(false);
                },
                error: (error) => {
                    console.error('Error al cargar médicos:', error);
                    this.errorMedicos.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudieron cargar los médicos.',
                        ),
                    );
                    this.cargandoMedicos.set(false);
                },
            });
    }

    cargarReservas(): void {
        this.cargandoReservas.set(true);
        this.errorReservas.set('');

        this.reservasService.obtenerReservasAdmin().subscribe({
            next: (reservas) => {
                this.reservas.set(reservas);
                this.cargandoReservas.set(false);
            },
            error: (error) => {
                console.error('Error al cargar reservas:', error);
                this.errorReservas.set(
                    this.obtenerMensajeError(
                        error,
                        'No se pudieron cargar los turnos.',
                    ),
                );
                this.cargandoReservas.set(false);
            },
        });
    }

    reservar(): void {
        if (this.creandoReserva()) {
            return;
        }

        this.errorNuevaReserva.set('');
        this.mensajeExito.set('');

        const idPaciente = Number(this.nuevaReserva.id_paciente);
        const idMedico = Number(this.nuevaReserva.id_medico);
        const { fecha, hora } = this.nuevaReserva;

        if (!idPaciente || !idMedico || !fecha || !hora) {
            this.errorNuevaReserva.set(
                'Completá el paciente, el médico, la fecha y el horario.',
            );
            return;
        }

        if (fecha < this.fechaMinima || fecha > this.fechaMaxima) {
            this.errorNuevaReserva.set(
                'Elegí una fecha dentro de los próximos 30 días.',
            );
            return;
        }

        // El backend espera la fecha como DD/MM/AAAA HH:mm.
        const [anio, mes, dia] = fecha.split('-');

        this.creandoReserva.set(true);

        this.reservasService
            .crearReservaAdmin({
                id_paciente: idPaciente,
                id_medico: idMedico,
                fecha_hora: `${dia}/${mes}/${anio} ${hora}`,
            })
            .subscribe({
                next: () => {
                    this.creandoReserva.set(false);
                    this.mensajeExito.set('Turno reservado correctamente.');

                    this.nuevaReserva = {
                        id_paciente: '',
                        id_medico: '',
                        fecha: '',
                        hora: '',
                    };

                    this.cargarReservas();
                },
                error: (error) => {
                    console.error('Error al reservar turno:', error);
                    this.creandoReserva.set(false);
                    this.errorNuevaReserva.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudo reservar el turno.',
                        ),
                    );
                },
            });
    }

    cancelarReserva(reserva: Reserva): void {
        this.abrirConfirmacion(
            'Cancelar turno',
            `¿Querés cancelar el turno de ${reserva.paciente?.nombre ?? 'este paciente'} del ${this.formatearFecha(reserva.fecha_hora)}?`,
            'Cancelar turno',
            { tipo: 'cancelarReserva', reserva },
        );
    }

    private ejecutarCancelacion(reserva: Reserva): void {
        this.procesandoAccionModal.set(true);
        this.errorReservas.set('');
        this.mensajeExito.set('');

        this.reservasService.cancelarReservaAdmin(reserva.id).subscribe({
            next: () => {
                this.procesandoAccionModal.set(false);
                this.modalAdmin.set(null);
                this.mensajeExito.set('Turno cancelado correctamente.');
                this.cargarReservas();
            },
            error: (error) => {
                console.error('Error al cancelar turno:', error);
                this.procesandoAccionModal.set(false);
                this.modalAdmin.set(null);
                this.errorReservas.set(
                    this.obtenerMensajeError(
                        error,
                        'No se pudo cancelar el turno.',
                    ),
                );
            },
        });
    }

    guardarValor(medico: MedicoApi): void {
        if (this.guardandoValorId() !== null) {
            return;
        }

        this.errorMedicos.set('');
        this.mensajeExito.set('');

        const nuevoValor = Number(this.valoresEditados[medico.id]);

        if (!Number.isFinite(nuevoValor) || nuevoValor <= 0) {
            this.errorMedicos.set(
                'El valor de la consulta debe ser un número mayor a cero.',
            );
            return;
        }

        this.guardandoValorId.set(medico.id);

        this.reservasService
            .modificarValorConsulta(medico.id, nuevoValor)
            .subscribe({
                next: () => {
                    this.guardandoValorId.set(null);
                    this.mensajeExito.set(
                        `Valor de consulta de ${medico.nombre} actualizado.`,
                    );
                    this.cargarMedicos();
                },
                error: (error) => {
                    console.error('Error al modificar valor:', error);
                    this.guardandoValorId.set(null);
                    this.errorMedicos.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudo modificar el valor de la consulta.',
                        ),
                    );
                },
            });
    }

    esActiva(reserva: Reserva): boolean {
        return reserva.estado.trim().toUpperCase() === 'ACTIVO';
    }

    formatearFecha(fecha: string): string {
        const fechaConvertida = new Date(fecha);

        if (Number.isNaN(fechaConvertida.getTime())) {
            return 'Fecha no disponible';
        }

        return new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(fechaConvertida);
    }

    formatearImporte(valor: number): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2,
        }).format(Number(valor) || 0);
    }

    cerrarSesion(): void {
        this.abrirConfirmacion(
            'Cerrar sesión',
            '¿Estás segura de que querés cerrar sesión?',
            'Cerrar sesión',
            { tipo: 'cerrarSesion' },
        );
    }
}
