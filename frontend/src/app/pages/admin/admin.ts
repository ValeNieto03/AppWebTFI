import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

interface PersonaSolicitud {
    id: number;
    nombre: string;
    email?: string;
}

interface SolicitudCorreccion {
    id: number;
    id_reserva: number;
    id_medico: number;
    estado_actual: string;
    estado_solicitado: string;
    motivo: string;
    estado_solicitud: 'Pendiente' | 'Aprobada' | 'Rechazada';
    id_administrador: number | null;
    respuesta_admin: string | null;
    fecha_solicitud: string;
    fecha_resolucion: string | null;
    medico?: PersonaSolicitud;
    paciente?: PersonaSolicitud;
    fecha_reserva?: string;
    estado_reserva_actual?: string;
}

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

type EstadoFiltro = 'Todas' | 'Pendiente' | 'Aprobada' | 'Rechazada';
type OrdenFecha = 'recientes' | 'antiguas';

type SeccionAdmin =
    | 'resumen'
    | 'usuarios'
    | 'crearUsuario'
    | 'medicos'
    | 'pacientes'
    | 'solicitudes';

type AccionModalAdmin =
    | { tipo: 'cerrarSesion' }
    | {
        tipo: 'cambiarEstadoUsuario';
        usuario: UsuarioApi;
        nuevoEstado: string;
    }
    | {
        tipo: 'resolverSolicitud';
        solicitud: SolicitudCorreccion;
        estado: 'Aprobada' | 'Rechazada';
    };

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
export class Admin implements OnInit, OnDestroy {
    private readonly apiBase = '/api/v1';
    private readonly apiReservas = `${this.apiBase}/reservas`;

    private mensajeTimeout: ReturnType<typeof setTimeout> | null = null;
    private solicitudTimeout: ReturnType<typeof setTimeout> | null = null;

    usuarios = signal<UsuarioApi[]>([]);
    pacientes = signal<UsuarioApi[]>([]);
    medicos = signal<MedicoApi[]>([]);
    solicitudes = signal<SolicitudCorreccion[]>([]);

    cargandoUsuarios = signal(false);
    cargandoPacientes = signal(false);
    cargandoMedicos = signal(false);
    cargandoSolicitudes = signal(false);

    creandoUsuario = signal(false);
    guardandoEdicion = signal(false);
    procesandoId = signal<number | null>(null);

    usuarioEditando = signal<UsuarioApi | null>(null);

    errorUsuarios = signal('');
    mensajeUsuarios = signal('');
    errorEdicion = signal('');
    mensajeEdicion = signal('');

    errorPacientes = signal('');
    errorMedicos = signal('');
    errorSolicitudes = signal('');
    mensajeSolicitudes = signal('');

    modalAdmin = signal<ModalAdmin | null>(null);
    procesandoAccionModal = signal(false);

    seccionActiva = signal<SeccionAdmin>('resumen');

    estadoFiltro = signal<EstadoFiltro>('Pendiente');
    ordenFecha = signal<OrdenFecha>('recientes');
    busqueda = signal('');
    fechaDesde = signal('');
    fechaHasta = signal('');

    respuestas: Record<number, string> = {};

    nuevoUsuario = {
        documento: '',
        apellidos: '',
        nombres: '',
        email: '',
        clave: '',
        estado: 'ACTIVO',
        rol: 'PACIENTE',
        matricula: '',
        valor_consulta: '',
    };

    datosEdicionUsuario = {
        documento: '',
        nombres: '',
        apellidos: '',
        email: '',
        estado: 'ACTIVO',
    };

    solicitudesFiltradas = computed(() => {
        const termino = this.busqueda().trim().toLocaleLowerCase('es-AR');
        const estado = this.estadoFiltro();
        const desde = this.fechaDesde();
        const hasta = this.fechaHasta();
        const orden = this.ordenFecha();

        return this.solicitudes()
            .filter((solicitud) => {
                if (
                    estado !== 'Todas' &&
                    solicitud.estado_solicitud !== estado
                ) {
                    return false;
                }

                const fecha = this.obtenerDia(solicitud.fecha_solicitud);

                if (desde && (!fecha || fecha < desde)) {
                    return false;
                }

                if (hasta && (!fecha || fecha > hasta)) {
                    return false;
                }

                if (termino) {
                    const texto = [
                        solicitud.id,
                        solicitud.id_reserva,
                        solicitud.medico?.nombre ?? '',
                        solicitud.medico?.email ?? '',
                        solicitud.paciente?.nombre ?? '',
                        solicitud.paciente?.email ?? '',
                        solicitud.motivo ?? '',
                        solicitud.estado_actual ?? '',
                        solicitud.estado_solicitado ?? '',
                    ].join(' ').toLocaleLowerCase('es-AR');

                    if (!texto.includes(termino)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fecha_solicitud).getTime();
                const fechaB = new Date(b.fecha_solicitud).getTime();

                const valorA = Number.isNaN(fechaA) ? 0 : fechaA;
                const valorB = Number.isNaN(fechaB) ? 0 : fechaB;

                return orden === 'recientes'
                    ? valorB - valorA
                    : valorA - valorB;
            });
    });

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly http: HttpClient,
    ) { }

    ngOnInit(): void {
        this.cargarUsuarios();
        this.cargarPacientes();
        this.cargarMedicos();
        this.cargarSolicitudes();
    }

    ngOnDestroy(): void {
        if (this.mensajeTimeout !== null) {
            clearTimeout(this.mensajeTimeout);
        }

        if (this.solicitudTimeout !== null) {
            clearTimeout(this.solicitudTimeout);
        }
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

    private mostrarMensajeTemporal(mensaje: string): void {
        this.mensajeUsuarios.set(mensaje);

        if (this.mensajeTimeout !== null) {
            clearTimeout(this.mensajeTimeout);
        }

        this.mensajeTimeout = setTimeout(() => {
            this.mensajeUsuarios.set('');
            this.mensajeTimeout = null;
        }, 3000);
    }

    private mostrarMensajeSolicitudTemporal(mensaje: string): void {
        this.mensajeSolicitudes.set(mensaje);

        if (this.solicitudTimeout !== null) {
            clearTimeout(this.solicitudTimeout);
        }

        this.solicitudTimeout = setTimeout(() => {
            this.mensajeSolicitudes.set('');
            this.solicitudTimeout = null;
        }, 3000);
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
        const accion = modal.accion;

        if (accion.tipo === 'cerrarSesion') {
            return true;
        }

        if (accion.tipo === 'cambiarEstadoUsuario') {
            return accion.nuevoEstado === 'BAJA';
        }

        return accion.estado === 'Rechazada';
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

            case 'cambiarEstadoUsuario':
                this.ejecutarCambioEstadoUsuario(
                    modal.accion.usuario,
                    modal.accion.nuevoEstado,
                );
                break;

            case 'resolverSolicitud':
                this.ejecutarResolucionSolicitud(
                    modal.accion.solicitud,
                    modal.accion.estado,
                );
                break;
        }
    }

    cambiarSeccion(seccion: SeccionAdmin): void {
        this.seccionActiva.set(seccion);
        this.errorUsuarios.set('');
        this.errorPacientes.set('');
        this.errorMedicos.set('');
    }

    cargarUsuarios(): void {
        this.cargandoUsuarios.set(true);
        this.errorUsuarios.set('');

        this.http
            .get<UsuarioApi[] | { usuarios: UsuarioApi[] }>(
                `${this.apiBase}/usuarios`,
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: (respuesta) => {
                    const lista = Array.isArray(respuesta)
                        ? respuesta
                        : respuesta.usuarios ?? [];

                    this.usuarios.set(lista);
                    this.cargandoUsuarios.set(false);
                },
                error: (error) => {
                    console.error('Error al cargar usuarios:', error);
                    this.errorUsuarios.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudieron cargar los usuarios.',
                        ),
                    );
                    this.cargandoUsuarios.set(false);
                },
            });
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

    editarUsuario(usuario: UsuarioApi): void {
        this.usuarioEditando.set(usuario);

        this.datosEdicionUsuario = {
            documento: usuario.documento ?? '',
            nombres: usuario.nombres ?? '',
            apellidos: usuario.apellidos ?? '',
            email: usuario.email ?? '',
            estado: usuario.estado ?? 'ACTIVO',
        };

        this.errorEdicion.set('');
        this.mensajeEdicion.set('');
    }

    cancelarEdicion(): void {
        if (this.guardandoEdicion()) {
            return;
        }

        this.usuarioEditando.set(null);
        this.errorEdicion.set('');
        this.mensajeEdicion.set('');
    }

    guardarEdicionUsuario(): void {
        const usuario = this.usuarioEditando();

        if (!usuario || this.guardandoEdicion()) {
            return;
        }

        this.errorEdicion.set('');
        this.mensajeEdicion.set('');

        const documento = this.datosEdicionUsuario.documento.trim();
        const nombres = this.datosEdicionUsuario.nombres.trim();
        const apellidos = this.datosEdicionUsuario.apellidos.trim();
        const email = this.datosEdicionUsuario.email.trim();
        const estado = this.datosEdicionUsuario.estado;

        if (!documento || !nombres || !apellidos || !email) {
            this.errorEdicion.set(
                'Completá el documento, los nombres, los apellidos y el email.',
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.errorEdicion.set('Ingresá un email válido.');
            return;
        }

        if (estado !== 'ACTIVO' && estado !== 'BAJA') {
            this.errorEdicion.set('Seleccioná un estado válido.');
            return;
        }

        this.guardandoEdicion.set(true);

        this.http
            .patch<UsuarioApi>(
                `${this.apiBase}/usuarios/${usuario.id}`,
                { documento, nombres, apellidos, email, estado },
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: (usuarioActualizado) => {
                    this.usuarios.update((lista) =>
                        lista.map((item) =>
                            item.id === usuario.id
                                ? { ...item, ...usuarioActualizado }
                                : item,
                        ),
                    );

                    this.guardandoEdicion.set(false);
                    this.usuarioEditando.set(null);

                    this.mostrarMensajeTemporal(
                        'Usuario editado correctamente.',
                    );

                    this.cargarUsuarios();
                    this.cargarPacientes();
                    this.cargarMedicos();
                },
                error: (error) => {
                    console.error('Error al editar usuario:', error);
                    this.guardandoEdicion.set(false);
                    this.errorEdicion.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudo editar el usuario.',
                        ),
                    );
                },
            });
    }

    cambiarEstadoUsuario(usuario: UsuarioApi): void {
        const nuevoEstado =
            usuario.estado?.toUpperCase() === 'ACTIVO'
                ? 'BAJA'
                : 'ACTIVO';

        const accion = nuevoEstado === 'BAJA'
            ? 'dar de baja'
            : 'activar';

        const nombreCompleto =
            `${usuario.nombres} ${usuario.apellidos}`.trim();

        this.abrirConfirmacion(
            nuevoEstado === 'BAJA'
                ? 'Dar de baja usuario'
                : 'Activar usuario',
            `¿Querés ${accion} al usuario ${nombreCompleto}?`,
            nuevoEstado === 'BAJA'
                ? 'Dar de baja'
                : 'Activar usuario',
            {
                tipo: 'cambiarEstadoUsuario',
                usuario,
                nuevoEstado,
            },
        );
    }

    private ejecutarCambioEstadoUsuario(
        usuario: UsuarioApi,
        nuevoEstado: string,
    ): void {
        this.procesandoAccionModal.set(true);
        this.errorUsuarios.set('');

        this.http
            .patch<UsuarioApi>(
                `${this.apiBase}/usuarios/${usuario.id}`,
                { estado: nuevoEstado },
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: () => {
                    this.procesandoAccionModal.set(false);
                    this.modalAdmin.set(null);

                    this.mostrarMensajeTemporal(
                        nuevoEstado === 'BAJA'
                            ? 'Estado actualizado: usuario dado de baja.'
                            : 'Estado actualizado: usuario activado.',
                    );

                    this.cargarUsuarios();
                    this.cargarPacientes();
                    this.cargarMedicos();
                },
                error: (error) => {
                    console.error('Error al cambiar estado:', error);
                    this.procesandoAccionModal.set(false);
                    this.modalAdmin.set(null);

                    this.errorUsuarios.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudo actualizar el estado del usuario.',
                        ),
                    );
                },
            });
    }

    crearUsuario(): void {
        if (this.creandoUsuario()) {
            return;
        }

        this.errorUsuarios.set('');
        this.mensajeUsuarios.set('');

        const documento = this.nuevoUsuario.documento.trim();
        const apellidos = this.nuevoUsuario.apellidos.trim();
        const nombres = this.nuevoUsuario.nombres.trim();
        const email = this.nuevoUsuario.email.trim();
        const clave = this.nuevoUsuario.clave;
        const rol = this.nuevoUsuario.rol;

        if (!documento || !apellidos || !nombres || !email || !clave) {
            this.errorUsuarios.set(
                'Completá todos los campos obligatorios.',
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.errorUsuarios.set('Ingresá un email válido.');
            return;
        }

        if (clave.length < 8) {
            this.errorUsuarios.set(
                'La contraseña debe tener al menos 8 caracteres.',
            );
            return;
        }

        const matriculaIngresada =
            String(this.nuevoUsuario.matricula).trim() !== '';

        const valorIngresado =
            String(this.nuevoUsuario.valor_consulta).trim() !== '';

        if (
            rol === 'MEDICO' &&
            (matriculaIngresada || valorIngresado)
        ) {
            if (!matriculaIngresada || !valorIngresado) {
                this.errorUsuarios.set(
                    'Si querés cargar los datos profesionales ahora, completá tanto la matrícula como el valor de consulta. También podés dejar ambos vacíos.',
                );
                return;
            }

            const matricula = Number(this.nuevoUsuario.matricula);
            const valorConsulta = Number(this.nuevoUsuario.valor_consulta);

            if (
                !Number.isFinite(matricula) ||
                matricula <= 0 ||
                !Number.isFinite(valorConsulta) ||
                valorConsulta <= 0
            ) {
                this.errorUsuarios.set(
                    'La matrícula y el valor de consulta deben ser mayores a cero.',
                );
                return;
            }
        }

        const datosUsuario = {
            documento,
            apellidos,
            nombres,
            email,
            clave,
            estado: this.nuevoUsuario.estado,
            rol,
        };

        this.creandoUsuario.set(true);

        this.http
            .post<UsuarioApi>(
                `${this.apiBase}/usuarios`,
                datosUsuario,
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: (usuarioCreado) => {
                    if (rol === 'MEDICO') {
                        const matriculaIngresada =
                            String(this.nuevoUsuario.matricula).trim() !== '';

                        const valorIngresado =
                            String(this.nuevoUsuario.valor_consulta).trim() !== '';

                        if (matriculaIngresada && valorIngresado) {
                            this.crearFichaMedico(usuarioCreado);
                            return;
                        }

                        this.creandoUsuario.set(false);

                        this.mostrarMensajeTemporal(
                            'Usuario médico creado correctamente. Deberá completar su perfil profesional al iniciar sesión.',
                        );

                        this.limpiarFormularioUsuario();
                        this.cargarUsuarios();
                        this.cargarMedicos();
                        return;
                    }

                    this.creandoUsuario.set(false);

                    this.mostrarMensajeTemporal(
                        `${rol} creado correctamente.`,
                    );

                    this.limpiarFormularioUsuario();
                    this.cargarUsuarios();

                    if (rol === 'PACIENTE') {
                        this.cargarPacientes();
                    }
                },
                error: (error) => {
                    console.error('Error al crear usuario:', error);

                    this.errorUsuarios.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudo crear el usuario.',
                        ),
                    );

                    this.creandoUsuario.set(false);
                },
            });
    }

    private crearFichaMedico(usuarioCreado: UsuarioApi): void {
        const datosMedico = {
            id_usuario: usuarioCreado.id,
            matricula: Number(this.nuevoUsuario.matricula),
            valor_consulta: Number(this.nuevoUsuario.valor_consulta),
        };

        this.http
            .post(
                `${this.apiBase}/medicos`,
                datosMedico,
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: () => {
                    this.creandoUsuario.set(false);

                    this.mostrarMensajeTemporal(
                        'El usuario y la ficha profesional del médico se crearon correctamente.',
                    );

                    this.limpiarFormularioUsuario();
                    this.cargarUsuarios();
                    this.cargarMedicos();
                },
                error: (error) => {
                    console.error(
                        'Error al crear ficha profesional:',
                        error,
                    );

                    this.creandoUsuario.set(false);
                    this.cargarUsuarios();

                    this.errorUsuarios.set(
                        `El usuario ${usuarioCreado.nombres} ${usuarioCreado.apellidos} se creó correctamente, pero no se pudo crear su ficha profesional. No vuelvas a crear el usuario. Revisá el error y registrá la ficha médica para el usuario ID ${usuarioCreado.id}. Detalle: ${this.obtenerMensajeError(
                            error,
                            'Error desconocido.',
                        )}`,
                    );
                },
            });
    }

    private limpiarFormularioUsuario(): void {
        this.nuevoUsuario = {
            documento: '',
            apellidos: '',
            nombres: '',
            email: '',
            clave: '',
            estado: 'ACTIVO',
            rol: 'PACIENTE',
            matricula: '',
            valor_consulta: '',
        };
    }

    contarEstado(estado: EstadoFiltro): number {
        if (estado === 'Todas') {
            return this.solicitudes().length;
        }

        return this.solicitudes().filter(
            (solicitud) => solicitud.estado_solicitud === estado,
        ).length;
    }

    contarPendientes(): number {
        return this.contarEstado('Pendiente');
    }

    cambiarEstadoFiltro(estado: EstadoFiltro): void {
        this.estadoFiltro.set(estado);
    }

    limpiarFiltros(): void {
        this.busqueda.set('');
        this.fechaDesde.set('');
        this.fechaHasta.set('');
        this.ordenFecha.set('recientes');
        this.estadoFiltro.set('Pendiente');
    }

    private obtenerDia(fecha: string | undefined): string {
        return fecha ? String(fecha).slice(0, 10) : '';
    }

    cargarSolicitudes(): void {
        this.cargandoSolicitudes.set(true);
        this.errorSolicitudes.set('');

        this.http
            .get<
                SolicitudCorreccion[] |
                { solicitudes: SolicitudCorreccion[] }
            >(
                `${this.apiReservas}/admin/solicitudes-correccion`,
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: (respuesta) => {
                    const lista = Array.isArray(respuesta)
                        ? respuesta
                        : respuesta.solicitudes ?? [];

                    this.solicitudes.set(lista);
                    this.cargandoSolicitudes.set(false);
                },
                error: (error) => {
                    console.error('Error al cargar solicitudes:', error);
                    this.cargandoSolicitudes.set(false);

                    this.errorSolicitudes.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudieron cargar las solicitudes. Verificá tu sesión y que el backend esté funcionando.',
                        ),
                    );
                },
            });
    }

    resolverSolicitud(
        solicitud: SolicitudCorreccion,
        estado: 'Aprobada' | 'Rechazada',
    ): void {
        if (
            this.procesandoId() !== null ||
            solicitud.estado_solicitud !== 'Pendiente'
        ) {
            return;
        }

        const accion = estado === 'Aprobada' ? 'aprobar' : 'rechazar';

        this.abrirConfirmacion(
            estado === 'Aprobada'
                ? 'Aprobar solicitud'
                : 'Rechazar solicitud',
            `¿Querés ${accion} la solicitud del turno ${solicitud.id_reserva}?`,
            estado === 'Aprobada'
                ? 'Aprobar solicitud'
                : 'Rechazar solicitud',
            {
                tipo: 'resolverSolicitud',
                solicitud,
                estado,
            },
        );
    }

    private ejecutarResolucionSolicitud(
        solicitud: SolicitudCorreccion,
        estado: 'Aprobada' | 'Rechazada',
    ): void {
        if (
            this.procesandoId() !== null ||
            solicitud.estado_solicitud !== 'Pendiente'
        ) {
            this.modalAdmin.set(null);
            return;
        }

        this.procesandoId.set(solicitud.id);
        this.procesandoAccionModal.set(true);
        this.errorSolicitudes.set('');

        const respuestaAdmin =
            (this.respuestas[solicitud.id] ?? '').trim();

        this.http
            .patch(
                `${this.apiReservas}/admin/solicitudes-correccion/${solicitud.id}`,
                {
                    estado,
                    ...(respuestaAdmin
                        ? { respuesta_admin: respuestaAdmin }
                        : {}),
                },
                { headers: this.obtenerHeaders() },
            )
            .subscribe({
                next: () => {
                    this.procesandoId.set(null);
                    this.procesandoAccionModal.set(false);
                    this.modalAdmin.set(null);

                    this.mostrarMensajeSolicitudTemporal(
                        estado === 'Aprobada'
                            ? `La solicitud del turno ${solicitud.id_reserva} fue aprobada.`
                            : `La solicitud del turno ${solicitud.id_reserva} fue rechazada.`,
                    );

                    this.cargarSolicitudes();
                },
                error: (error) => {
                    console.error('Error al resolver solicitud:', error);
                    this.procesandoId.set(null);
                    this.procesandoAccionModal.set(false);
                    this.modalAdmin.set(null);

                    this.errorSolicitudes.set(
                        this.obtenerMensajeError(
                            error,
                            'No se pudo resolver la solicitud.',
                        ),
                    );
                },
            });
    }

    formatearFecha(fecha: string | undefined): string {
        if (!fecha) {
            return 'Fecha no disponible';
        }

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