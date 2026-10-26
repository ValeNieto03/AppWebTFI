import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

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
    | 'medicos'
    | 'pacientes';

type AccionModalAdmin =
    | { tipo: 'cerrarSesion' };

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

    cargandoPacientes = signal(false);
    cargandoMedicos = signal(false);

    errorPacientes = signal('');
    errorMedicos = signal('');

    modalAdmin = signal<ModalAdmin | null>(null);
    procesandoAccionModal = signal(false);

    seccionActiva = signal<SeccionAdmin>('resumen');

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly http: HttpClient,
    ) { }

    ngOnInit(): void {
        this.cargarPacientes();
        this.cargarMedicos();
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
        return modal.accion.tipo === 'cerrarSesion';
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
        }
    }

    cambiarSeccion(seccion: SeccionAdmin): void {
        this.seccionActiva.set(seccion);
        this.errorPacientes.set('');
        this.errorMedicos.set('');
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
